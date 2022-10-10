import ExternalLink from '../../components/external-link';
import Api3Icon from '../../components/icons/api3-icon';
import ExternalLinkIcon from '../../components/icons/external-link-icon';
import KlerosIcon from '../../components/icons/kleros-icon';
import { Tooltip } from '../../components/tooltip';
import { images } from '../../utils';
import styles from './roles.module.scss';

export default function Roles() {
  return (
    <section className={styles.rolesSection}>
      <h6>
        Roles
        <Tooltip
          id="roles-tooltip"
          overlay={
            <div className={styles.tooltip}>
              <p>
                The <b>mediator (API3 Mediators)</b> is responsible for deciding the initial outcome of claims and
                paying out successful claims.
              </p>
              <p>
                The <b>arbitrator (Kleros)</b> is an independent decentralized court appointed to settle a dispute.
              </p>
            </div>
          }
        >
          <button aria-describedby="roles-tooltip">
            <img src={images.help} aria-hidden alt="" />
            <span className="sr-only">View roles info</span>
          </button>
        </Tooltip>
      </h6>
      <div className={styles.roleItem}>
        <span>Mediator</span>
        <ExternalLink href="https://api3.org">
          <Api3Icon aria-hidden /> API3 Mediators
          <ExternalLinkIcon aria-hidden className={styles.externalLinkIcon} />
        </ExternalLink>
      </div>
      <div className={styles.roleItem}>
        <span>Arbitrator</span>
        <ExternalLink href="https://kleros.io">
          <KlerosIcon aria-hidden /> Kleros
          <ExternalLinkIcon aria-hidden className={styles.externalLinkIcon} />
        </ExternalLink>
      </div>
    </section>
  );
}
