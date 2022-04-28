import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import styles from '../../styles/home/categories.module.scss';

export default function UserCard({ session }: { session: Session; }) {
    return (
        <div className={styles['user-card-wrapper']}>
            <div className={styles['user-card']}>
                <Image
                    src={session.user.image}
                    width={28}
                    height={28}
                    alt={`${session.user.name}'s avatar`}
                />
                {session.user.name}
            </div>
            <button onClick={() => signOut()} className={styles['disconnect-btn']}>
                Se déconnecter
            </button>
        </div>
    )
}