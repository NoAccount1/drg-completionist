import React, { useContext, useEffect } from "react";
import { graphql, PageProps } from "gatsby";
import WeaponDivider from "../../components/WeaponDivider";
import { Row } from "antd";
import OverclockCard from "../../components/overclocks/OverclockCard";
import { FooterContext } from "../../components/Layout";
import useMinerOverclockProgress from "../../hooks/useMinerOverclockProgress";
import ProgressFooter from "../../components/ProgressFooter";

const Overclocks = ({
  data: { minersJson: miner },
}: PageProps<Queries.OverclocksQuery>) => {
  const progress = useMinerOverclockProgress(miner!);
  const setFooter = useContext(FooterContext);
  useEffect(() => {
    if (progress) {
      setFooter(
        <ProgressFooter
          totalItems={progress.totalOverclocks}
          completedItems={progress.forgedOverclocks}
          unforgedItems={progress.unforegedOverclocks}
        />
      );
    }
  }, [progress, setFooter]);

  return (
    <>
      {miner?.weapons?.map((weapon) => (
        <React.Fragment key={weapon.name}>
          <WeaponDivider weapon={weapon} />
          <Row gutter={[16, 16]}>
            {weapon.overclocks?.map((overclock) => (
              <OverclockCard
                key={overclock!.name}
                overclock={overclock!}
                miner={miner!}
                weapon={weapon!}
              />
            ))}
          </Row>
        </React.Fragment>
      ))}
    </>
  );
};

export default Overclocks;

export const query = graphql`
  query Overclocks($id: String) {
    minersJson(id: { eq: $id }) {
      name

      weapons {
        name
        overclocks {
          name

          ...OverclockCardOverclock
        }

        ...WeaponDividerWeapon
        ...OverclockCardWeapon
      }

      ...OverclockCardMiner
      ...MinerOverclockProgressMiner
    }
  }
`;