import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import { TabName } from 'App';
import { ArmorPaintjobs, CommonArmorPaintjobs } from 'data/armor';
import { FrameworkIDs } from 'data/frameworks';
import { Miner } from 'data/miner';
import { Overclocks } from 'data/overclocks';
import {
  PickaxePaintjobNames,
  PickaxeSets,
  PickaxeUniquePartNames,
} from 'data/pickaxes';
import { CommonWeaponPaintjobs, MatrixWeaponPaintjobs, UniqueWeaponPaintjobs } from 'data/weaponPaintjobs';
import { MinerWeapons } from 'data/weapons';
import useDB from 'db/useDB';

type TabProgress = {
  progress: number;
  partialProgress: number | null;
};

export default function useCurrentTabProgress(
  currentTab: TabName
): TabProgress {
  const db = useDB();

  const totalItems = useMemo(() => {
    switch (currentTab) {
      case 'frameworks':
        return Object.values(FrameworkIDs).flatMap((w) => Object.values(w))
          .length;
      case 'overclocks':
        return Object.values(Overclocks)
          .flatMap((w) => Object.values(w))
          .flat().length;
      case 'armor':
        return (
          Object.values(ArmorPaintjobs)
            .flatMap((w) => Object.values(w))
            .flat().length + CommonArmorPaintjobs.length
        );
      case 'weaponPaintjobs':
        return (
          UniqueWeaponPaintjobs.length *
          Object.values(MinerWeapons).flatMap((w) => Object.values(w)).length +
          MatrixWeaponPaintjobs.length * Object.values(Miner).length +
          CommonWeaponPaintjobs.length * Object.values(Miner).length
        );
      case 'pickaxes':
        return (
          PickaxeSets.length * 5 +
          PickaxePaintjobNames.length +
          PickaxeUniquePartNames.length
        );
    }
  }, [currentTab]) as number;

  const p = useLiveQuery(
    async () => {
      switch (currentTab) {
        case 'frameworks': {
          const acquiredFrameworks = await db.frameworks.count();
          return {
            progress: (acquiredFrameworks / totalItems) * 100,
            partialProgress: null,
          };
        }
        case 'overclocks': {
          const acquiredOverclocks = await db.overclocks.toArray();
          return {
            progress:
              (acquiredOverclocks.filter((o) => o.isForged).length /
                totalItems) *
              100,
            partialProgress:
              (acquiredOverclocks.filter((o) => !o.isForged).length /
                totalItems) *
              100,
          };
        }
        case 'armor': {
          const acquiredArmorPaintjobs = await db.armorPaintjobs.count();
          const acquiredCommonArmorPaintJobs = await db.commonArmorPaintjobs.count();
          return {
            progress:
              ((acquiredArmorPaintjobs + acquiredCommonArmorPaintJobs) /
                totalItems) *
              100,
            partialProgress: null,
          };
        }
        case 'weaponPaintjobs': {
          const acquiredMatrixPaintjobs = await db.matrixWeaponPaintjobs.toArray();
          const acquiredUniquePaintjobs = await db.uniqueWeaponPaintjobs.toArray();
          const acquiredCommonPaintjobs = await db.commonWeaponPaintjobs.toArray();
          const progress = ((acquiredCommonPaintjobs.length + acquiredUniquePaintjobs.length + acquiredMatrixPaintjobs.filter((p) => p.isForged).length) / totalItems) * 100;
          const partialProgress = acquiredMatrixPaintjobs.filter((p) => !p.isForged).length / totalItems * 100;
          return {
            progress: progress,
            partialProgress: partialProgress,
          };
        }
        case 'pickaxes': {
          const acquiredPickaxeParts = await db.pickaxes.count();
          const acquiredPickaxeUniques = await db.pickaxeUniques.count();
          return {
            progress:
              ((acquiredPickaxeParts + acquiredPickaxeUniques) / totalItems) *
              100,
            partialProgress: null,
          };
        }
      }
    },
    [currentTab],
    {
      progress: 0,
      partialProgress: null,
    }
  ) as { progress: number; partialProgress: number };

  useEffect(() => {
    gtag('event', `progress`, {
      event_category: 'tab_progress',
      event_label: currentTab,
      value: Math.round(p.progress),
    });
  }, [p.progress, currentTab]);

  return {
    progress: Math.round(p.progress),
    partialProgress:
      p.partialProgress === null ? null : Math.round(p.partialProgress),
  };
}
