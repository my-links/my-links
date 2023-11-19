import PageTransition from "components/PageTransition";
import styles from "styles/legal-pages.module.scss";
import clsx from "clsx";
import LinkTag from "next/link";
import Navbar from "components/Navbar/Navbar";
import { getServerSideTranslation } from "../i18n";

export default function Terms() {
  return (
    <PageTransition className={clsx("App", styles["privacy"])}>
      <Navbar />
      <main>
        <h1>Conditions Générales d'Utilisation de MyLinks</h1>
        <p>Dernière mise à jour : 19/11/2023</p>
        <p>
          Bienvenue sur MyLinks, un gestionnaire de favoris gratuit et open
          source axé sur la privacy et le self hosting. En utilisant ce service,
          vous acceptez les conditions générales d'utilisation énoncées
          ci-dessous. Veuillez les lire attentivement.
        </p>

        <h2>1. Acceptation des Conditions</h2>
        <p>
          En accédant à MyLinks et en utilisant nos services, vous acceptez de
          vous conformer à ces Conditions Générales d'Utilisation.
        </p>

        <h2>2. Utilisation du Service</h2>
        <h3>2.1 Compte Utilisateur</h3>
        <p>
          Pour accéder à certaines fonctionnalités de MyLinks, vous devrez créer
          un compte utilisateur. Vous êtes responsable de la confidentialité de
          votre compte et de vos informations d'identification.
        </p>

        <h3>2.2 Utilisation Autorisée</h3>
        <p>
          Vous vous engagez à utiliser MyLinks conformément aux lois en vigueur
          et à ne pas violer les droits de tiers.
        </p>

        <h3>2.3 Contenu Utilisateur</h3>
        <p>
          En publiant du contenu sur MyLinks, vous accordez à MyLinks une
          licence mondiale, non exclusive, transférable et gratuite pour
          utiliser, reproduire, distribuer et afficher ce contenu.
        </p>

        <h2>3. Données Personnelles</h2>
        <h3>3.1 Collecte et Utilisation</h3>
        <p>
          Les données personnelles collectées sont utilisées conformément à
          notre <LinkTag href="/privacy">Politique de Confidentialité</LinkTag>.
          En utilisant MyLinks, vous consentez à cette collecte et utilisation.
        </p>

        <h3>3.2 Suppression de Compte</h3>
        <p>
          Vous pouvez demander la suppression de votre compte à tout moment
          conformément à notre Politique de Confidentialité.
        </p>

        <h2>4. Responsabilités et Garanties</h2>
        <h3>4.1 Responsabilité</h3>
        <p>
          MyLinks ne peut être tenu responsable des dommages directs ou
          indirects découlant de l'utilisation de nos services.
        </p>

        <h3>4.2 Garanties</h3>
        <p>
          MyLinks ne garantit pas que le service sera exempt d'erreurs ou de
          interruptions.
        </p>

        <h2>5. Modifications des Conditions</h2>
        <p>
          MyLinks se réserve le droit de modifier ces Conditions Générales
          d'Utilisation à tout moment. Les utilisateurs seront informés des
          changements par le biais d'une notification sur le site.
        </p>

        <h2>6. Résiliation</h2>
        <p>
          MyLinks se réserve le droit de résilier ou de suspendre votre accès au
          service, avec ou sans préavis, en cas de violation de ces Conditions
          Générales d'Utilisation.
        </p>

        <h2>7. Contact</h2>
        <p>
          Pour toute question ou préoccupation concernant ces Conditions
          Générales d'Utilisation, veuillez nous contacter à l'adresse suivante
          :{" "}
          <LinkTag href="mailto:sonnyasdev@gmail.com" target="_blank">
            sonnyasdev[at]gmail.com
          </LinkTag>
          .
        </p>
      </main>
    </PageTransition>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getServerSideTranslation(locale)),
    },
  };
}
