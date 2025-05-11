
import styles from '../styles/depthAura.module.css';

export default function DepthAura({ level }) {
  if (!level) return null;

  let className = '';
  switch (level) {
    case '🪶 Very Light':
      className = styles.veryLight;
      break;
    case '🌿 Light':
      className = styles.light;
      break;
    case '🔥 Deep':
      className = styles.deep;
      break;
    case '🌌 Very Deep':
      className = styles.veryDeep;
      break;
    default:
      className = styles.light;
  }

  return (
    <div className={styles.auraContainer}>
      <div className={`${styles.auraRing} ${className}`} />
    </div>
  );
}
