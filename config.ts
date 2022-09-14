// const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC_';

// const getEnvironmentVariable = (environmentVariable: string = ''): string => {
//     if (!environmentVariable.startsWith(NEXT_PUBLIC_PREFIX)) {
//         throw new Error(
//             `Env var must start with "${NEXT_PUBLIC_PREFIX}": ${environmentVariable}`
//         );
//     }

//     const envVarObject = Object
//         .entries(process.env)
//         .map(([key, value]) => ({ name: key, value }))
//         .find((env) => {
//             console.log(env.name === environmentVariable);
//             return env.name === environmentVariable;
//         });

//     console.log('envVarObject', envVarObject, process.env.NEXT_PUBLIC_SITE_NAME)

//     if (!envVarObject) {
//         throw new Error(
//             `Couldn't find environment variable: ${environmentVariable}`
//         );
//     } else {
//         return envVarObject.value;
//     }
// };

export const config = {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME // getEnvironmentVariable(NEXT_PUBLIC_PREFIX + 'SITE_NAME'),
};

console.log('config', config)