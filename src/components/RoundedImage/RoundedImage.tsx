import Image from 'next/image';
import styles from './rounded-image.module.scss';

export default function RoundedImage({
  src,
  width = 24,
  height = 24,
  alt,
}: (typeof Image)['defaultProps']) {
  return (
    <div className={styles['rounded-image']}>
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        title={alt}
      />
    </div>
  );
}
