import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

const date = '16/10/2026';

const BODY_CLASS =
	'text-base leading-relaxed text-ink/70 dark:text-ink-dark/70';
const CARD_CLASS =
	'bg-paper dark:bg-ink rounded-xl p-6 border border-rule dark:border-rule-dark';

const Section = ({
	number,
	title,
	children,
}: {
	number: number;
	title: ReactNode;
	children: ReactNode;
}) => (
	<section className="mb-10">
		<div className="flex items-center gap-3 mb-6">
			<div className="w-10 h-10 rounded-lg bg-brand dark:bg-brand-dark flex items-center justify-center text-paper font-display">
				{number}
			</div>
			<h2 className="font-display text-3xl text-ink dark:text-ink-dark">
				{title}
			</h2>
		</div>
		<div className="ml-14 space-y-8">{children}</div>
	</section>
);

const Subsection = ({
	title,
	children,
}: {
	title: ReactNode;
	children: ReactNode;
}) => (
	<div>
		<h3 className="text-xl font-semibold mb-3 text-ink dark:text-ink-dark">
			{title}
		</h3>
		{children}
	</div>
);

const BulletList = ({ children }: { children: ReactNode }) => (
	<div className={CARD_CLASS}>
		<ul className={`space-y-3 list-disc pl-5 ${BODY_CLASS}`}>{children}</ul>
	</div>
);

const PrivacyPage = () => (
	<div className="max-w-[800px] mx-auto pt-8">
		<div className="mb-12 pb-8 border-b border-rule dark:border-rule-dark">
			<h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-ink-dark mb-4">
				<Trans>Privacy Policy of MyLinks</Trans>
			</h1>
			<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rule dark:border-rule-dark">
				<span className="text-sm font-medium text-ink/70 dark:text-ink-dark/70">
					<Trans>Last updated: {date}</Trans>
				</span>
			</div>
		</div>

		<div className="mb-12 p-6 bg-paper dark:bg-ink rounded-2xl border border-rule dark:border-rule-dark">
			<p className="text-lg leading-relaxed text-ink/80 dark:text-ink-dark/80">
				<Trans>
					MyLinks is a free and open-source bookmark manager that you can host
					yourself. This page explains what this instance stores about you, who
					can see it, how long it is kept and how to get rid of it. The
					administrator of this instance is the data controller and your contact
					for any request.
				</Trans>
			</p>
		</div>

		<Section number={1} title={<Trans>What we store about you</Trans>}>
			<Subsection title={<Trans>1.1 Your account</Trans>}>
				<BulletList>
					<li>
						<Trans>
							Your email address, your name or nickname, and the dates your
							account was created and last updated.
						</Trans>
					</li>
					<li>
						<Trans>
							A password hash if you sign in with a password, or your Google
							identifier if you sign in with Google. Your password is never
							stored in clear.
						</Trans>
					</li>
					<li>
						<Trans>
							The last time you were seen, updated at most every 5 minutes.
						</Trans>
					</li>
				</BulletList>
			</Subsection>

			<Subsection title={<Trans>1.2 Your content</Trans>}>
				<BulletList>
					<li>
						<Trans>
							Your collections (name, description, icon, visibility) and the
							links they contain (address, name, description).
						</Trans>
					</li>
					<li>
						<Trans>Your favorites and the collections you follow.</Trans>
					</li>
					<li>
						<Trans>
							For each link, a click counter and the time of the last click. No
							IP address, browser or referrer is recorded with a click, and
							there is no per-visit record. Only you see these totals.
						</Trans>
					</li>
				</BulletList>
			</Subsection>

			<Subsection title={<Trans>1.3 Security records</Trans>}>
				<BulletList>
					<li>
						<Trans>
							Sessions, with the IP address and browser of each sign-in. You can
							see and revoke them on your sessions page. They expire after 7
							days.
						</Trans>
					</li>
					<li>
						<Trans>
							An authentication journal (sign-ins, refusals, password and
							address changes, linked providers) with your IP address and
							browser. They are erased after 180 days. The event itself (type,
							account, time) is kept as security evidence.
						</Trans>
					</li>
					<li>
						<Trans>
							An activity journal of what you did (creating, editing or deleting
							collections and links, following, importing, exporting, deletion
							requests), with your IP address. It records identifiers and
							counts, never the content. Entries are deleted after 90 days.
						</Trans>
					</li>
					<li>
						<Trans>
							Short-lived tokens for email confirmation, password reset and
							address change, removed a day after they expire or are used. Rate
							limiting counters are transient.
						</Trans>
					</li>
				</BulletList>
			</Subsection>

			<Subsection title={<Trans>1.4 Cookies</Trans>}>
				<p className={BODY_CLASS}>
					<Trans>
						MyLinks only uses the cookies required to keep you signed in and to
						protect your session. There are no advertising or tracking cookies.
					</Trans>
				</p>
			</Subsection>
		</Section>

		<Section number={2} title={<Trans>Who can see it</Trans>}>
			<div className={CARD_CLASS}>
				<ul className={`space-y-3 list-disc pl-5 ${BODY_CLASS}`}>
					<li>
						<Trans>Private collections are visible to you only.</Trans>
					</li>
					<li>
						<Trans>
							Public and shared collections show their name, description, icon
							and links, your display name and the number of followers to anyone
							who has access, including through the API. Your email, favorites,
							click counts and other collections are never exposed.
						</Trans>
					</li>
					<li>
						<Trans>
							Administrators see your email, how you sign in, how many
							collections and links you have and when you were last active. They
							see the journals with IP addresses partly masked. They never see
							your links, addresses, collection names or searches.
						</Trans>
					</li>
				</ul>
			</div>
		</Section>

		<Section number={3} title={<Trans>Third parties</Trans>}>
			<p className={BODY_CLASS}>
				<Trans>
					There is no analytics, no error tracking and no advertising. The
					server makes only a few outbound requests: it fetches the favicon of
					the website of each link you save, from the root address of that site
					only (never the full address), without any third-party favicon
					service; it contacts Google if you sign in with Google; and it sends
					emails through the mail server configured by the administrator.
				</Trans>
			</p>
			<p className={BODY_CLASS}>
				<Trans>
					Favicons are stored without any link to you and are removed once no
					link uses that website any more. Your browser loads them through this
					instance only. Links to other websites do not send a referrer.
				</Trans>
			</p>
		</Section>

		<Section number={4} title={<Trans>Browser extension</Trans>}>
			<p className={BODY_CLASS}>
				<Trans>
					If you use the browser extension, it syncs your collections only while
					you are connected. It sends a link only when you save it, and reports
					visits to saved links opened from the extension. If you turn on the
					optional bookmark mirror, it uploads the bookmarks you save afterwards
					to your bookmarks bar and those you add to collection folders. It
					talks to this instance only and has no third-party service.
				</Trans>
			</p>
		</Section>

		<Section number={5} title={<Trans>Your rights and deletion</Trans>}>
			<p className={BODY_CLASS}>
				<Trans>
					You can export your data from your settings at any time. When you
					request deletion, your account has a 30-day grace period during which
					you can change your mind. An account unused for 365 days, or one an
					administrator deletes, goes through the same grace period. Afterwards
					your account and everything you own are permanently deleted. The only
					thing that remains is the authentication journal events, detached from
					any account and stripped of IP address and browser after 180 days.
				</Trans>
			</p>
			<p className={BODY_CLASS}>
				<Trans>
					Public collections of an account pending deletion are hidden during
					the grace period. For any other request about your data, contact the
					administrator of this instance.
				</Trans>
			</p>
		</Section>

		<section className="mb-10">
			<div className="ml-14">
				<div className="bg-paper dark:bg-ink rounded-xl p-6 border border-brand dark:border-brand-dark">
					<p className="text-base leading-relaxed text-ink/80 dark:text-ink-dark/80 font-medium">
						<Trans>
							MyLinks is built to comply with the General Data Protection
							Regulation (GDPR) of the European Union.
						</Trans>
					</p>
				</div>
			</div>
		</section>
	</div>
);

export default PrivacyPage;
