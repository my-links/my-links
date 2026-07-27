import { REGISTRATION_POLICY, type RegistrationPolicy } from '#constants/auth';

export type RegistrationPolicyInputs = {
	readonly configuredPolicy: RegistrationPolicy | undefined;
	readonly hasAnyAccount: boolean;
};

export type ResolvedRegistrationPolicy = {
	readonly isOpen: boolean;
};

/**
 * Decides whether an instance takes new accounts.
 *
 * An operator who states a policy always gets it. Left unset, the answer is the
 * bootstrap window: a freshly deployed instance has to let its first account in
 * — there is nobody to invite them yet — and closes as soon as that account
 * exists, so a self-hoster who never reads the documentation does not end up
 * running an open sign-up form on the public internet.
 */
export function resolveRegistrationPolicy({
	configuredPolicy,
	hasAnyAccount,
}: RegistrationPolicyInputs): ResolvedRegistrationPolicy {
	if (configuredPolicy) {
		return { isOpen: configuredPolicy === REGISTRATION_POLICY.OPEN };
	}

	return { isOpen: !hasAnyAccount };
}
