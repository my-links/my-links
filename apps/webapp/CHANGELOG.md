# Changelog

## [5.0.0](https://github.com/my-links/my-links/compare/4.3.4...webapp-v5.0.0) (2026-08-07)

### Features

* add reorder endpoints for collections and links ([2f9c8b1](https://github.com/my-links/my-links/commit/2f9c8b152e43a4f892aaf43e86735704e01cbcb8))
* **admin:** show how each account signs in, and journal what happens to it ([13586a7](https://github.com/my-links/my-links/commit/13586a7d0a7f66c4e5d82a3adb73687db16f0723))
* **admin:** tell a non-admin why they were bounced ([476df5d](https://github.com/my-links/my-links/commit/476df5d937d1b659c34b55d4facb54753814b94b))
* allow dragging collection cards by their whole surface ([ac69200](https://github.com/my-links/my-links/commit/ac69200408c727a084e2c510d82bc3034da978d6))
* allow saving a link without picking a collection ([56ab133](https://github.com/my-links/my-links/commit/56ab133f1c729f2eaa0ebb8a891950f415de6fe9))
* **api:** expose a delta sync feed with deletion tombstones ([cedbe88](https://github.com/my-links/my-links/commit/cedbe88eecba8c7aaee239580cbd7efacc516415))
* **auth:** add password sign-in on argon2id ([ce9cf1f](https://github.com/my-links/my-links/commit/ce9cf1ff62af8ea271cd0bcff7f6c73b562d8ab3))
* **auth:** link and unlink sign-in providers ([53ed64a](https://github.com/my-links/my-links/commit/53ed64af1651804123eb6a732385f764b4c58bc9))
* **auth:** make Google sign-in optional ([4af3372](https://github.com/my-links/my-links/commit/4af3372b1c58f5bea17e1fcbe131d19993209712))
* **auth:** manage passwords behind sudo mode ([a60a177](https://github.com/my-links/my-links/commit/a60a177b87e3ca0c904247e4c995efd12296aa64))
* **auth:** move an account to another email address ([89f4b2b](https://github.com/my-links/my-links/commit/89f4b2b96ecc3188eabbc75c3ee6951ae120fb25))
* **auth:** open registration with email verification ([389cafc](https://github.com/my-links/my-links/commit/389cafc8afba34de614ccd9ed17c550fe77083f8))
* **auth:** require a confirmed email to sign in where mail is configured ([f185886](https://github.com/my-links/my-links/commit/f185886e0853cf3a01dd1aa11c216bc15cce9659))
* **auth:** split identity from authentication methods ([e4cffa5](https://github.com/my-links/my-links/commit/e4cffa5d3684586329e2fd2162efac1372049d23))
* badge links that belong to more than one collection ([be20929](https://github.com/my-links/my-links/commit/be2092964013fd40ecb69d43b0c86003099dd539))
* **console:** manage accounts with ace commands ([397020a](https://github.com/my-links/my-links/commit/397020a49cc505cfeff42c63a2b8c418b957569e))
* drag links to reorder and refile them across collections ([c8a34f6](https://github.com/my-links/my-links/commit/c8a34f68b35e0395144f56b114144fa028213e64))
* expose followed collections via the extension API ([28b1173](https://github.com/my-links/my-links/commit/28b1173019fe972547eebe1e4a672a667f38ab69))
* **extension:** accept Firefox's callback origin in the auth handoff ([6a3662d](https://github.com/my-links/my-links/commit/6a3662dce0c75c92edd7b61d57c82fcf066f46ca))
* **extension:** add collapse all / expand all sidebar buttons ([d100d37](https://github.com/my-links/my-links/commit/d100d37cb39323de9902beeacb7bad228cd16e24))
* **extension:** add CRUD API client and optimistic tree helpers ([6a70cf2](https://github.com/my-links/my-links/commit/6a70cf2886be24018fa8e8ad57e5b9b95aecef17))
* **extension:** add dnd-kit dependency and portable drag helpers ([379dc1a](https://github.com/my-links/my-links/commit/379dc1a8fa0da0c8d91ff9d80f2e572663a14309))
* **extension:** add newtab override sharing the sidebar's workspace ([2ae71e1](https://github.com/my-links/my-links/commit/2ae71e1edeb60fa025d1aaf332434e232f952f2a))
* **extension:** add optimistic mutation hooks for links and collections ([2069f25](https://github.com/my-links/my-links/commit/2069f251b06b4f5963aa8490cdd6eb32e3474772))
* **extension:** add release-it config for automated releases ([d98493e](https://github.com/my-links/my-links/commit/d98493eae4ab51caba4291f868fe36b1c444850c))
* **extension:** add right-click context menus to links and collections ([c86f9c3](https://github.com/my-links/my-links/commit/c86f9c315fd6214f8ffaf2d763b4505430e3e558))
* **extension:** add settings button to open options page ([e16be8e](https://github.com/my-links/my-links/commit/e16be8e70eee12f4e585256895b7e94a969910c3))
* **extension:** adopt bookmarks saved onto the bar as favourites ([b23dd9b](https://github.com/my-links/my-links/commit/b23dd9bcf711aaf7c725c4d41020620bba798a7d))
* **extension:** adopt unocss + shared UI components, wire typed API client ([565615d](https://github.com/my-links/my-links/commit/565615dd0370faa9478b468038688f6fc1940a4c))
* **extension:** build a manifest Firefox can actually install ([c4c8198](https://github.com/my-links/my-links/commit/c4c8198ace1e286f36ab0ea82e047ac70793015d))
* **extension:** claim a single MyLinks folder on the bookmarks bar ([647b401](https://github.com/my-links/my-links/commit/647b4013c7160655bc561ff8623bfe0e6390d132))
* **extension:** CRUD UI for links and collections ([4dfce82](https://github.com/my-links/my-links/commit/4dfce82569851fd71fae65afb0ef1ed665054fb7))
* **extension:** derive sync status for a stale-data badge ([4e2b3cb](https://github.com/my-links/my-links/commit/4e2b3cbb453dae6bddbfbb5e7cc8087f944cd0ad))
* **extension:** flag an invalid token distinctly from stale data ([11ce08c](https://github.com/my-links/my-links/commit/11ce08c4f5213501894959604d888f28b9887a2b))
* **extension:** live sidebar tree with MV3-safe background sync ([c8b2c71](https://github.com/my-links/my-links/commit/c8b2c718c72761a84e75ab3e0043bf54889b479d))
* **extension:** mirror collection and link order into bookmarks ([7c798ad](https://github.com/my-links/my-links/commit/7c798ad1e26b1963d62b5fcd95737cd6b5dd3eac))
* **extension:** mirror collections into native bookmarks both ways ([21e09f5](https://github.com/my-links/my-links/commit/21e09f5a77dbad665b48922f9e447483ff1d66c1))
* **extension:** offer to take the mirrored bookmarks back ([5a3ba96](https://github.com/my-links/my-links/commit/5a3ba961da4a078dd59c845a6cae26534d44314b))
* **extension:** persist sidebar collapse state and add shift-click to toggle all children ([f13fc5c](https://github.com/my-links/my-links/commit/f13fc5cf75c801ab139168c6c1bf790a6b30268e))
* **extension:** pin favourites to the bookmarks bar, ranked by clicks ([3207fef](https://github.com/my-links/my-links/commit/3207fefd3eecb2f9ad0ff3c62569751286da71d1))
* **extension:** quick-add via context menu and sidebar button ([b7f9d5c](https://github.com/my-links/my-links/commit/b7f9d5c03bbb4676aa15f90a9f2755e0db198f13))
* **extension:** reach search from anywhere with a keyboard shortcut ([a10df75](https://github.com/my-links/my-links/commit/a10df75d9c7a8051551b02cabab30e0a1991832e))
* **extension:** reorder and collapse sidebar sections ([75749e4](https://github.com/my-links/my-links/commit/75749e4a427cded0fc05c0d4f221de3eeece896f))
* **extension:** reorder followed collections with drag and drop ([c5f3590](https://github.com/my-links/my-links/commit/c5f3590c90b83d88a01cb1201e58964cb63d5e6c))
* **extension:** reorder owned collections with drag and drop ([67ee1b7](https://github.com/my-links/my-links/commit/67ee1b7da227c78ff853ae295c372bdb551a5511))
* **extension:** reorder, move and add links with drag and drop ([b48e9d5](https://github.com/my-links/my-links/commit/b48e9d50f55a9d573a92a18a1c82bbc4365bd841))
* **extension:** rework sidebar link search ([6b01741](https://github.com/my-links/my-links/commit/6b01741c6e5e43e56a212bde7cc9faff0002624d))
* **extension:** search bar wired to /api/v1/search ([f327868](https://github.com/my-links/my-links/commit/f327868acd2b09be0b64e22538adb0d0c7def047))
* **extension:** show followed collections in the panel ([11ad0d3](https://github.com/my-links/my-links/commit/11ad0d38ab92d93c9307cae9a8c48dbd9d1cf3ac))
* **extension:** support links in multiple collections ([d8452af](https://github.com/my-links/my-links/commit/d8452af566536bdc6e7e7e60756000cc1846fb2c))
* **extension:** switch sidebar search to client-side fuzzy matching ([e25d2c2](https://github.com/my-links/my-links/commit/e25d2c21e2ee82bede4b8d2eb99c9e914e51c27d))
* **extension:** wire CRUD, quick-add, and search into the sidebar header ([1283420](https://github.com/my-links/my-links/commit/12834205e1401f19f46dfa8306e84e39cb9012dd))
* **homepage:** add docs link card to hero and simplify demo card ([c59e240](https://github.com/my-links/my-links/commit/c59e240ada3d5ba809a88529a79337f36d9deb85))
* **home:** redesign the homepage around the link lifecycle, redirect signed-in visitors ([26b1d9c](https://github.com/my-links/my-links/commit/26b1d9c9475e2d85e477515512311d14ebf6cfbf))
* **landing:** lay the visual foundation for the public-facing pages ([516b831](https://github.com/my-links/my-links/commit/516b8318ff16178bb691be6a544a5ccb908761c2))
* let users reorder sidebar sections ([892c231](https://github.com/my-links/my-links/commit/892c231d7f46fb2b239e31ce9597879f62c76c05))
* **links:** add collection search filter to link forms ([1d77349](https://github.com/my-links/my-links/commit/1d773495b2da63b6ec3b0170fa1bc72706a36d07))
* **links:** count clicks through a single /l/:id redirect ([97a46d3](https://github.com/my-links/my-links/commit/97a46d313f49c6dc27b5b45df1da990b7fab73f7))
* **mail:** make outgoing email an optional capability ([ace360d](https://github.com/my-links/my-links/commit/ace360de0aa0c6b8d4d777120416af63cd559826))
* make the default collection read-only and implicit ([e3d9433](https://github.com/my-links/my-links/commit/e3d943364ae3f033a0b2e345fb42e26bd6e8f084))
* mirror collection and link reorder endpoints under the JSON API ([34ddce7](https://github.com/my-links/my-links/commit/34ddce73f86463d485a81756b259a78bd0d53b75))
* move and add links across collections ([c92bff0](https://github.com/my-links/my-links/commit/c92bff075dc4e11d05e4033748779808531e027c))
* order collections and links by explicit position ([5c6eca4](https://github.com/my-links/my-links/commit/5c6eca4facf72b1ace561fa120267b887289eb9b))
* reorder sidebar collections with drag and drop ([bd5397f](https://github.com/my-links/my-links/commit/bd5397f03be43515cd27d121d5131507d8d1abf8))
* **seeders:** give each user 10 collections with 15 links each ([7a04d8e](https://github.com/my-links/my-links/commit/7a04d8e1e8ef7725a0dc160228628eb940ba0e81))
* **webapp,extension:** use distinct icon for inbox collection ([269c047](https://github.com/my-links/my-links/commit/269c0475ca23ef3aafac61381c014921e6be784d))
* **webapp:** accept legacy nested-links format on import ([e23b9b0](https://github.com/my-links/my-links/commit/e23b9b0d62dae09033a73e017fa45ddac97cd4f7))
* **webapp:** add activity event service ([2e8c679](https://github.com/my-links/my-links/commit/2e8c67971132f8909b9705b011a08fee9c4d5e69))
* **webapp:** add activity:prune command for journal retention ([4b4aea4](https://github.com/my-links/my-links/commit/4b4aea47e6016a5fffb94cae6f68fc78f922e2b7))
* **webapp:** add admin activity journal UI ([14a6d0e](https://github.com/my-links/my-links/commit/14a6d0e1a24bae1efb47483db739681f3352c01c)), references [#4102](https://github.com/my-links/my-links/issues/4102)
* **webapp:** add collapse all / expand all sidebar buttons ([8fd394c](https://github.com/my-links/my-links/commit/8fd394c1c92000d3060c56afe5f0135deddb8478))
* **webapp:** add collection_link pivot, backfill, drop links.collection_id ([b41999a](https://github.com/my-links/my-links/commit/b41999ab1d06ae748342015e6108223f17ffa354))
* **webapp:** add guided onboarding tour to dashboard ([8d8c6f2](https://github.com/my-links/my-links/commit/8d8c6f2a4092160cca2a778e9b6a798d0dc79f7a))
* **webapp:** add inline add-link control to sidebar collection items ([f779b99](https://github.com/my-links/my-links/commit/f779b99e90755e8b4599d518392af708d710c235))
* **webapp:** announce major releases in a banner ([3e7fd15](https://github.com/my-links/my-links/commit/3e7fd155d17ef86fb85a0f9afa3c8a47277f71a9))
* **webapp:** don't force collection creation to add a link ([7f6eaf6](https://github.com/my-links/my-links/commit/7f6eaf6a7c9ecce7b8421448ef1a49408a4256a9))
* **webapp:** drop server-side search ([372638c](https://github.com/my-links/my-links/commit/372638c1de2c3c2b001e60f7e3755df484b596b9))
* **webapp:** drop single-collection assumption from search ([656742a](https://github.com/my-links/my-links/commit/656742ab0dd8f5f75333bdfd27bda7724d779421))
* **webapp:** generalize auth_events into audit_events ([dc9efdd](https://github.com/my-links/my-links/commit/dc9efdda9b27ea740599293c234d21b0271bb55e))
* **webapp:** generate OpenAPI spec via @outloud/adonis-openapi ([b5919ee](https://github.com/my-links/my-links/commit/b5919eed512982196df77cd9f3ee8cff21989142))
* **webapp:** journal collection and link activity ([114fa13](https://github.com/my-links/my-links/commit/114fa1313f6c341554662e40f60c1a1d1505b195))
* **webapp:** journal import, export and account deletion ([0072153](https://github.com/my-links/my-links/commit/007215318ef79c6511ccf546f7d13dc0fb7bf43b))
* **webapp:** move create-collection action into sidebar and pin favorites atop the list ([10feada](https://github.com/my-links/my-links/commit/10feada641869c755a41b7a74991ae82751d9170))
* **webapp:** multi-collection reads and writes across services ([37576d8](https://github.com/my-links/my-links/commit/37576d85d3f5dddf81eb4953d72b03c29003db30))
* **webapp:** multi-select collections in the link form ([07b5bf1](https://github.com/my-links/my-links/commit/07b5bf1638a08e7c51b85715ab500dbbeaa930cb))
* **webapp:** persist sidebar section collapse state ([5c187f1](https://github.com/my-links/my-links/commit/5c187f157f57eeafb3eae178d272a9ecfec1a46b))
* **webapp:** rate limit /api/v1/* against runaway clients ([5187b75](https://github.com/my-links/my-links/commit/5187b75031f2a5b0e0b45dedbcb39db639a42b91))
* **webapp:** reorder onboarding tour and add favorites step ([acd03b1](https://github.com/my-links/my-links/commit/acd03b146651e74e6e0cef27515685b43f79bb87))
* **webapp:** show current session indicator in sessions list ([ea417d0](https://github.com/my-links/my-links/commit/ea417d03f8f948b3519cd6a13afc05f3e9922d29))
* **webapp:** show followed collections count in admin users table ([5a730c0](https://github.com/my-links/my-links/commit/5a730c0d0c065f77f3649553a5e9514b7ff1ac93))
* **webapp:** show visibility description via RadioOptions ([0d93ad8](https://github.com/my-links/my-links/commit/0d93ad870bf26996937e2f4db12a9f29a93a25e6))
* **webapp:** switch dashboard search to client-side fuzzy matching ([44dfbbd](https://github.com/my-links/my-links/commit/44dfbbd49c14316ecc25a12739ddae460dc6ff28))
* **webapp:** trim collection header to contextual actions only ([ee06b8f](https://github.com/my-links/my-links/commit/ee06b8f1ee2af076256e1e288440bf4dfcb6f743))

### Bug Fixes

* always show the Followed Collections section ([93f59fc](https://github.com/my-links/my-links/commit/93f59fc38bf5e4d2281d04035c0f5fa63f82d244))
* **api:** answer API callers with the real error instead of a stub ([951a3df](https://github.com/my-links/my-links/commit/951a3df498dd28814856ceb31a66d8861e024d95))
* **api:** answer the extension's cross-origin requests on Firefox ([8e0b650](https://github.com/my-links/my-links/commit/8e0b650321b85220dbe93fd9e0db5ca96f52a51f))
* **auth:** normalize the email a provider hands over ([59dfbca](https://github.com/my-links/my-links/commit/59dfbcaae73f67eb3621df333c3689507ae9c9b3))
* **ci:** align pnpm version in docs workflow with lockfile ([96dfcaf](https://github.com/my-links/my-links/commit/96dfcaf9c974edefc11a5538619d2ae467fb71df))
* **collections:** mark visibility as a required field ([9b40489](https://github.com/my-links/my-links/commit/9b40489feadc3ac10a7b24c04f69c1377ffb2b41))
* **deps:** patch brace-expansion ReDoS and esbuild file-read advisories ([318fa47](https://github.com/my-links/my-links/commit/318fa478fb47851202f7136cd4c40d209f2f3916))
* **docker:** use the database session store in production ([3fa924d](https://github.com/my-links/my-links/commit/3fa924dd3a191907d82b7e51d8334955f3993f58))
* expose context menu items to the accessibility tree ([d7a4b83](https://github.com/my-links/my-links/commit/d7a4b83c1603d4e384b8dfa02109eb566678fabe))
* **extension:** add drag overlay to stop dnd-kit scaling the dragged collection to match its drop target ([bf83cba](https://github.com/my-links/my-links/commit/bf83cbae4cb3ab9077e70cd90e8390da22d8f385))
* **extension:** add missing copy link action to link kebab menu ([4d8ef4a](https://github.com/my-links/my-links/commit/4d8ef4aa6b3bfedc6e59d79c3a05dd7ad8ff2cc1))
* **extension:** correct Firefox gecko extension id ([8482d19](https://github.com/my-links/my-links/commit/8482d1936d84543cb3065c71197c15350f94455f))
* **extension:** disable native html drag on link rows and favicons ([290959e](https://github.com/my-links/my-links/commit/290959ef8f2a8949b6fe71f133932e54346996cc))
* **extension:** keep a de-collected link visible via its Inbox fallback ([b8bdfc1](https://github.com/my-links/my-links/commit/b8bdfc1aa4b7fdb642bd96aa18274ed3641d8206))
* **extension:** namespace collection and link sortable ids ([7de57a2](https://github.com/my-links/my-links/commit/7de57a2b714d18defbde076f66a01d3ab31d9420))
* **extension:** read a saved page by its date, not by where it landed ([cf0ec45](https://github.com/my-links/my-links/commit/cf0ec457a036b3408b9d3f72796ad648128c5670))
* **extension:** resolve link drops to the innermost target under the pointer ([553be67](https://github.com/my-links/my-links/commit/553be678f5688f6bfe85bb49f20b603249a363b0))
* **extension:** show loading state until followed collections finish loading ([6351d8e](https://github.com/my-links/my-links/commit/6351d8e243400ea60b95f2acccde724be0aac022))
* **extension:** stop claiming a bookmark the user already had ([ceba01a](https://github.com/my-links/my-links/commit/ceba01a6c460b77d4167601b08d829547a4216d5))
* **extension:** stop collapsed collections from stretching on reorder animation ([2575d31](https://github.com/my-links/my-links/commit/2575d31b446548db2456faeaf47337c6616a3a15))
* **extension:** stop pushing changes the server is bound to rewrite ([4ad80a8](https://github.com/my-links/my-links/commit/4ad80a8503593cdcbe353355ef18029a3288b6fb))
* **extension:** stop the mirror creating a link per pass forever ([54b9d5e](https://github.com/my-links/my-links/commit/54b9d5e3e969bdb274f48972938c114a426ee588))
* **extension:** stop unfavouriting pins and losing mirror passes ([b6cfb9f](https://github.com/my-links/my-links/commit/b6cfb9f6fec34e2ea3dce1d7481055a01b02e207))
* **extension:** target the collection under the pointer when reordering ([48154fb](https://github.com/my-links/my-links/commit/48154fbce42c2ddccee8ffc74e0d7227eabdbd9e))
* **extension:** tell apart who changed a bookmark, and recover a lost mapping ([6dd7ae9](https://github.com/my-links/my-links/commit/6dd7ae9f6642766345adb20dba451af1232a03a9))
* **favicon:** fall back to empty-image.png instead of icon font ([6c48063](https://github.com/my-links/my-links/commit/6c480630263681066f4eee27c860b3d8d5f91cc9))
* **forms:** show the required-field asterisk on link name/URL and token name ([e86aa2b](https://github.com/my-links/my-links/commit/e86aa2b9570bec1678825ffbed71f6149ab4a365))
* **infra:** bind postgres port to localhost instead of 0.0.0.0 ([a928a84](https://github.com/my-links/my-links/commit/a928a84167f0c7df71b28fd4cf8fbef2ff40ee19))
* keep the drag overlay within the viewport ([1b5fbf9](https://github.com/my-links/my-links/commit/1b5fbf9593647c8c891df046817e6a9cefea474a))
* **logging:** keep one-time link tokens out of the request log ([f87f5ba](https://github.com/my-links/my-links/commit/f87f5ba2c744188018d7d7a3c25fc40b8da168fe))
* match the link drag overlay to the active layout ([4d7dcf5](https://github.com/my-links/my-links/commit/4d7dcf5db87e4f36ee330e8cef9498bfdca54876))
* **modal:** resolve promise self-reference cycle on Modal.end(call) ([4d9692a](https://github.com/my-links/my-links/commit/4d9692a7dd032ba8f295e4a111696c982e7640ed))
* move sidebar section reorder behind its context menu ([575b090](https://github.com/my-links/my-links/commit/575b090bcc290cf56783361965303735b1caaf9e))
* **navbar:** fix icon color under backdrop-blur navbar ([7ca0612](https://github.com/my-links/my-links/commit/7ca06122ceb1e80902a806cd055c1c4168c91bc0))
* order the extension collections endpoint by position ([e697f81](https://github.com/my-links/my-links/commit/e697f811ab3890aac9ff59a6b74bd5a9942bd93a))
* **seeder:** clamp link description length ([b8c48b8](https://github.com/my-links/my-links/commit/b8c48b8de7986f8db4c3eb1bc2332b389ea5a129))
* **seeders:** attach seeded links through the collection pivot ([e3af73b](https://github.com/my-links/my-links/commit/e3af73bd265ade4ae8902f242d4fc126d791b79b))
* **seeders:** use real words and working domains ([3c8945e](https://github.com/my-links/my-links/commit/3c8945e4d3af816186c7237694e08a07c215a687))
* stop hiding faults behind expected failures ([a6ca7f4](https://github.com/my-links/my-links/commit/a6ca7f454e053e94303bccfca08ef7c2b1318a91))
* stop the extension from reordering an edited link to the end ([828132a](https://github.com/my-links/my-links/commit/828132af319b28b788d30b65cb4a0aa248e822a5))
* **tests:** keep the developer's leftover tokens out of the suite ([8353e40](https://github.com/my-links/my-links/commit/8353e402456c2a9841b61921ec77c8f7a91fcc6e))
* **tests:** keep the developer's registration policy out of the suite ([0e26436](https://github.com/my-links/my-links/commit/0e26436be1fcd777313bc58ff810692e06304b10))
* **webapp:** add missing fr translation for current session label ([3278bb1](https://github.com/my-links/my-links/commit/3278bb1c4e326c9279e3428868664551025e7f53))
* **webapp:** add missing fr translations for sidebar and tour strings ([825fe97](https://github.com/my-links/my-links/commit/825fe97044e50c42ed240586f4fd3edf44abb2fc))
* **webapp:** add top spacing to search modal input ([9f5eada](https://github.com/my-links/my-links/commit/9f5eada23e12d1e324339b79dc69dd4ecdd2f52b))
* **webapp:** allow long URLs in import validation ([5b9f8b6](https://github.com/my-links/my-links/commit/5b9f8b6319abc38429e964ad8a0ea17dbfc2e723))
* **webapp:** close SSRF bypasses in favicon URL validation ([d3d8cd7](https://github.com/my-links/my-links/commit/d3d8cd7c6d4105e93232555a079c75f08888d442))
* **webapp:** default missing collection lists in useDashboardProps ([5e5a35b](https://github.com/my-links/my-links/commit/5e5a35bdee967e1ab70375890f16ad438b2c0c86))
* **webapp:** enable CSP and X-Frame-Options ([2b3f65c](https://github.com/my-links/my-links/commit/2b3f65c0d65192b7d2f4b25273767e6631065e49))
* **webapp:** force full-page nav for extension callback mid Inertia visit ([cc8cf0e](https://github.com/my-links/my-links/commit/cc8cf0e152d443974502e7357e65b097f4202f68))
* **webapp:** hide edit/delete controls for inbox collection ([e6d2122](https://github.com/my-links/my-links/commit/e6d2122e23d57432bed9e1c9610eb667f24bee12))
* **webapp:** hide follow button on own shared collection ([1af0878](https://github.com/my-links/my-links/commit/1af087846f85e99c4aa10027760c29c21c9154e4))
* **webapp:** include origin when copying shared collection link ([3d101b4](https://github.com/my-links/my-links/commit/3d101b4d04addabd60a7c99f6ae5229b5adb9688))
* **webapp:** keep google identities on backfill rollback ([afa9aa0](https://github.com/my-links/my-links/commit/afa9aa0b52325f27a85bf77a149fd9d8edf2f146))
* **webapp:** make admin dashboard responsive on mobile ([3d0fa4a](https://github.com/my-links/my-links/commit/3d0fa4ae594cabfe866d0c5b489bb96cbe1a56d5))
* **webapp:** make dashboard responsive on mobile ([48c6062](https://github.com/my-links/my-links/commit/48c6062c6bf853d1fb26b33230193681b889bf57))
* **webapp:** make search_text function re-runnable under migration:fresh ([923c769](https://github.com/my-links/my-links/commit/923c7690b0d39d5ea824117e72e5f5f88b23af5f))
* **webapp:** match section hover highlight to full row like collection items ([0cb4430](https://github.com/my-links/my-links/commit/0cb4430393ce5e5b07735fc6ca726f97e808e480))
* **webapp:** migrate modals to @minimalstuff/ui v2 imperative API ([7b67968](https://github.com/my-links/my-links/commit/7b679685be22ff2256973570ceb6d858a8271b4c))
* **webapp:** move share icon button next to search bar ([0489001](https://github.com/my-links/my-links/commit/0489001cf47aa2f9335cda4f194600af82881023))
* **webapp:** pass the csp nonce to the vite dev scripts ([494058a](https://github.com/my-links/my-links/commit/494058a6e49cd5e6fe63fa5d6eb4a47b9805c9e3))
* **webapp:** prevent context menu item labels from wrapping ([45eb58e](https://github.com/my-links/my-links/commit/45eb58eae29c3f628efdb98a08138e7979ca5be7))
* **webapp:** reconstruct favicon Buffer lost to bentocache serialization ([ac851da](https://github.com/my-links/my-links/commit/ac851da9d58c728dcd0a9d1fe13cf63b59cacee7))
* **webapp:** reject following own collection ([a7375e5](https://github.com/my-links/my-links/commit/a7375e52545aadf185a2df6580e154c48adfffee))
* **webapp:** reject foreign collection ids on link create/update ([a2c57b9](https://github.com/my-links/my-links/commit/a2c57b9a0dfc2a464ac8179bfccb06662a127950))
* **webapp:** replace auth.user! with auth.getUserOrFail() ([1effdb8](https://github.com/my-links/my-links/commit/1effdb875197ae6670b50b3631f4094677983a95))
* **webapp:** replace remaining auth.user! in link/collection services ([73a92bb](https://github.com/my-links/my-links/commit/73a92bbaaa0b0538494dbc3b761518d8b9dae9dc))
* **webapp:** resolve transformer responses before returning API JSON ([6368f0c](https://github.com/my-links/my-links/commit/6368f0cb2ec7e55ae85b1858b063f295ae631be3)), references [#private](https://github.com/my-links/my-links/issues/private)
* **webapp:** set security headers on error pages ([c84967f](https://github.com/my-links/my-links/commit/c84967f3384e62491146e3c85918a4a000b78c4a))
* **webapp:** show favorites view for accounts with no links yet ([2b96e5e](https://github.com/my-links/my-links/commit/2b96e5e28ae6a3f93267987c603227a3a58c85d1))
* **webapp:** sign out current session when revoked from settings ([f38c9e7](https://github.com/my-links/my-links/commit/f38c9e75b8ebb461faef91e37f9fb38bdd3fa158))
* **webapp:** stop click event leaking into create-collection modal ([9c6cc3f](https://github.com/my-links/my-links/commit/9c6cc3fd7412880df30e23162f0504a42996c86d))
* **webapp:** stop dashboard tour modal and hover race from blocking browser tests ([ea66903](https://github.com/my-links/my-links/commit/ea66903ce51a4eb0ea729ed653ebcffb051a2b37))
* **webapp:** stop leaking the app version on /api/v1/health ([2235e17](https://github.com/my-links/my-links/commit/2235e17ffae52be2263a60a8960d04d0dd28b89a))
* **webapp:** translate missing French strings ([94651ad](https://github.com/my-links/my-links/commit/94651ade80bd70867e8abc35e1dc1687b52f5dc6))

## [4.3.4](https://github.com/my-links/my-links/compare/4.3.3...4.3.4) (2026-03-16)

### Bug Fixes

- **search:** fix http 422 error and refactor the search modal component ([7abf663](https://github.com/my-links/my-links/commit/7abf663d204242c71595b83c26c9935b72164850))

## [4.3.3](https://github.com/my-links/my-links/compare/4.3.2...4.3.3) (2026-03-04)

## [4.3.2](https://github.com/my-links/my-links/compare/4.3.1...4.3.2) (2026-03-04)

### Bug Fixes

- update session cookie name to 'my-links-session' for a smoother migration ([9428eab](https://github.com/my-links/my-links/commit/9428eabdc7d352f2d9e9396f11e8e211157287a0))

## [4.3.1](https://github.com/my-links/my-links/compare/4.3.0...4.3.1) (2026-03-04)

### Bug Fixes

- add null chaining check in inertia middleware ([3abe0e7](https://github.com/my-links/my-links/commit/3abe0e7b4cbf401d82eda2d62f7f130349eab8c7))

## [4.3.0](https://github.com/my-links/my-links/compare/4.2.1...4.3.0) (2026-03-04)

### Features

- create a data table component to replace the simple table component ([4a337e1](https://github.com/my-links/my-links/commit/4a337e1587c9d2e475956b8542b618c12bb04799))
- give users the ability to manage their sessions ([e80ca82](https://github.com/my-links/my-links/commit/e80ca82bde51127e96595a2e144795c316a1a7b4))

## [4.2.1](https://github.com/my-links/my-links/compare/4.2.0...4.2.1) (2026-03-02)

### Bug Fixes

- fix users tranformers ([c0080b0](https://github.com/my-links/my-links/commit/c0080b0ef4ba8219c38a0a3f0405f11beb898ed4))

## [4.2.0](https://github.com/my-links/my-links/compare/4.1.3...4.2.0) (2026-03-02)

### Features

- **admin:** add bulk delete users ([e548f60](https://github.com/my-links/my-links/commit/e548f609775668df7450854aacbab3a51f15f388))

### Bug Fixes

- **auth:** handle Inertia requests in Google authentication redirect ([6d3523b](https://github.com/my-links/my-links/commit/6d3523bbbcead1b6da7ebd2502dd35117cab80e3))
- button styles in user settings page ([9ff1bf6](https://github.com/my-links/my-links/commit/9ff1bf69e4d2868dd4bf1c25dce899b29b2a7623))
- fix lint issues ([7fde83d](https://github.com/my-links/my-links/commit/7fde83d800d3a8d4ad662a711bfde774d274ca63))
- inertia middleware errors ([455f24d](https://github.com/my-links/my-links/commit/455f24de6ad956bec9a614e3a8e4d7b4818cb7f4))
- missing translation in navbar ([e3c7eb7](https://github.com/my-links/my-links/commit/e3c7eb79f8e6121be1ace8b12c70ef2c64db7043))
- repace ADD with COPY instruction ([7412c68](https://github.com/my-links/my-links/commit/7412c68d8feadf251ca2fe8847bd92c74c04e45d))
- use entrypoint.sh script instead of inline command ([d2b0b1c](https://github.com/my-links/my-links/commit/d2b0b1c27272f3f15aaa2ca8d9b442498a3b8ce8))

## [4.1.3](https://github.com/my-links/my-links/compare/4.1.2...4.1.3) (2026-01-27)

### Bug Fixes

- missing translation for admin/user roles ([e73a54d](https://github.com/my-links/my-links/commit/e73a54d9d18366f940f6cb16a9ee8cd071e7b2b8))
- order columns in users table component ([0e0d1ec](https://github.com/my-links/my-links/commit/0e0d1ec0d51a81b03170eafe5695dd7893d03b36))
- pretty format date in users table component ([d2dbbe6](https://github.com/my-links/my-links/commit/d2dbbe6299c51294daa77e0517925476cc1552ef))

## [4.1.2](https://github.com/my-links/my-links/compare/4.1.1...4.1.2) (2026-01-27)

### Bug Fixes

- inaccessible shared collection when unauthenticated ([abf99de](https://github.com/my-links/my-links/commit/abf99de4decdf2ee7fbba876927e0810bdefe6fc))

## [4.1.1](https://github.com/my-links/my-links/compare/4.1.0...4.1.1) (2026-01-27)

### Bug Fixes

- followedCollections is not iterable on shared page ([191dea8](https://github.com/my-links/my-links/commit/191dea8056be7ae109658c7fd40a37b67357f965))

## [4.1.0](https://github.com/my-links/my-links/compare/4.0.1...4.1.0) (2026-01-27)

### Features

- add a quick action modal on mobile instead of displaying a bunch of buttons side by side ([62191d8](https://github.com/my-links/my-links/commit/62191d8039f203ccc5976072c628d787eebaa2f8))
- add api health check route ([4a4d981](https://github.com/my-links/my-links/commit/4a4d9811c3605859e678afa36e45a59fc284c518))
- add import/export feature ([dec6606](https://github.com/my-links/my-links/commit/dec66068e64c8feb183ca95234e73bf01a3cfd97))
- allow users to delete their account ([719015c](https://github.com/my-links/my-links/commit/719015c899ad139cbc6c61de713d1243bc011ad2))
- change locale switcher labels to SVG flags ([7efe3aa](https://github.com/my-links/my-links/commit/7efe3aabd62efef7eb7bb135fba7a7126bf2099b))
- redirect user to dashboard when trying to log in while already authenticated ([7db5503](https://github.com/my-links/my-links/commit/7db5503c69e7c531d4a31c4625f5e8799d321e87))
- redorder collections by name asc instead of creation date desc ([3f19ff1](https://github.com/my-links/my-links/commit/3f19ff1bcca60e63bd12e3f2c60b0d658771f0d4))

### Bug Fixes

- **api:** return JSON instead of redirecting the user to the collection.show route ([9eeca51](https://github.com/my-links/my-links/commit/9eeca51fecf7f92036ac357ae5a3a67b09945945))
- fix api token table style issue ([e4f5259](https://github.com/my-links/my-links/commit/e4f525904b01589c170a3ba5fd8aa4fdbac2cd9e))
- fix collections and links orders ([f887231](https://github.com/my-links/my-links/commit/f887231e804787690575f81e5ce5876470247045))
- fix the bug in the search modal that affects result selection ([a8484f9](https://github.com/my-links/my-links/commit/a8484f90d976d1ba01e6a75c8519610f575b5645))
- fix user settings page and add a link to the navbar ([831eafd](https://github.com/my-links/my-links/commit/831eafde15ac0572cffb4428c2955c1a70692b6f))
- missing csrf token on api routes ([f4cb7d0](https://github.com/my-links/my-links/commit/f4cb7d060ba41d18af2668302a4109bc862e110c))
- open the create collection modal if the user has no collections when trying to create a new link ([85cb5da](https://github.com/my-links/my-links/commit/85cb5dab85ea6b67821ed2a10d7f90a667d61f74))
- react error when opening create collection modal ([7e503cc](https://github.com/my-links/my-links/commit/7e503ccbf4d2b9e5447576016d9adec75927a1c1))
- repair edit/delete collection modal relying on activeCollection and fix collection context menu ([e5ddb0d](https://github.com/my-links/my-links/commit/e5ddb0d6392e0b6020942f1c193a95f3a38e9686))
- the context menu for a link does not work when you are on the favorites page ([8c5139d](https://github.com/my-links/my-links/commit/8c5139d202c72af3b5dba743d1f111326f2ac507))
- tweak collection item/favorite style ([f207fb9](https://github.com/my-links/my-links/commit/f207fb9bb226fb6c232c40fec172255ddda9cce1))

## [4.0.1](https://github.com/my-links/my-links/compare/4.0.0...4.0.1) (2026-01-14)

### Bug Fixes

- rollback changes for APP_URL ([134c181](https://github.com/my-links/my-links/commit/134c18165c1d90e3935dc21f65973fa48a9115d1))

## [4.0.0](https://github.com/my-links/my-links/compare/3.3.2...4.0.0) (2026-01-14)

### Features

- add copy link in context menu ([55f66e5](https://github.com/my-links/my-links/commit/55f66e512a8e1f50b867f5c306b11837f2a5f047))
- add icon support to collections with emoji picker ([95f6065](https://github.com/my-links/my-links/commit/95f606592b03ca35e22722e1a3bc6520db8819d8))
- add page transition hook ignore patterns ([6764908](https://github.com/my-links/my-links/commit/6764908895ab82c6c3a748dc9242e292a57d3ddf))
- add status page for admins ([63b1017](https://github.com/my-links/my-links/commit/63b1017b3effb4b01d75e7bdf20d38878cf0d3fe))
- change favorites route to /collections/favorites and add follow/unfollow collection routes ([ad4859b](https://github.com/my-links/my-links/commit/ad4859b47a2bab9e1acda7e4c2abc59fa381b21f))
- copy and show tooltip on copy share link ([75163ea](https://github.com/my-links/my-links/commit/75163eaaf9f9f5819600f2407b50218dea6fe75e))
- recreate dashboard from scratch ([5fd9e93](https://github.com/my-links/my-links/commit/5fd9e93a63d0773b9d1d920ebb6140c72d756d5c))
- recreate error pages ([e042b00](https://github.com/my-links/my-links/commit/e042b00ec1a427cc59a5f2d00a8c402f9625d7d4))
- recreate forms using modals instead of pages ([148199f](https://github.com/my-links/my-links/commit/148199fd5fd453a18ea8201ba70e9e226b8b0614))
- refont of admin dashboard and remove dayjs ([c002ef7](https://github.com/my-links/my-links/commit/c002ef76da107f7aae1d49978358efb532b8d8ab))
- restore "create collection" and "create kink" shortcuts ([2c6a3cc](https://github.com/my-links/my-links/commit/2c6a3cc469375b5b828942bcc943221a483da118))
- restore and improve the search modal ([cd4fca5](https://github.com/my-links/my-links/commit/cd4fca5025dc835e7667edab277fb3a1e3f19e56))
- show a followed collection into the dashboard ([0192d46](https://github.com/my-links/my-links/commit/0192d469b14837bc96db2aadbe20bcbd24343f25))

### Bug Fixes

- “should not already be working” caused by tuyau being recreated on every page change ([af3df1f](https://github.com/my-links/my-links/commit/af3df1ff3835dce11f1ebee79f60ad502ab12af9))
- add missing translations and stop using hardcoded IDs ([3579ed7](https://github.com/my-links/my-links/commit/3579ed7382efda0ed1d398c9745bd9113a5cc665))
- collection item boundaries ([e60b2ad](https://github.com/my-links/my-links/commit/e60b2ad71ae3989abaabfb19b40b3ccb803e66cf))
- form modal URLs ([9a379c5](https://github.com/my-links/my-links/commit/9a379c51b71b231032f005e081f19a9f07d5fa8e))
- improve navbar and footer responsiveness by adding a shared mobile menu ([7b97b99](https://github.com/my-links/my-links/commit/7b97b997c66b9cb3d4a1dfda53f0305f1367547a))
- link controls behavior ([42c3a5e](https://github.com/my-links/my-links/commit/42c3a5e72bc08d1d2f3eb1fa77c3c689507432f2))
- make transition only when pathname change ([8de00fd](https://github.com/my-links/my-links/commit/8de00fd33e0f2f5f02ef3e84d7d936496d2ea451))
- missing translations ([e16d737](https://github.com/my-links/my-links/commit/e16d737385768ff4a367738a900e95cf5e8f77ad))
- page transitioning target ([06ec46f](https://github.com/my-links/my-links/commit/06ec46fc63e8d4c303016ec990c2519aa355fe59))
- pnpm lock file ([3d7abb5](https://github.com/my-links/my-links/commit/3d7abb5af51c249095b05f1e5f399d6de5359a23))
- responsive issues in dashboard UI ([ee3bbcb](https://github.com/my-links/my-links/commit/ee3bbcb75bb1cbec9d10739b0ad8cf3fab881fdb))

## [3.3.2](https://github.com/my-links/my-links/compare/3.3.1...3.3.2) (2025-12-14)

## [3.3.1](https://github.com/my-links/my-links/compare/3.3.0...3.3.1) (2025-11-09)

### Bug Fixes

- broken imports ([3591d03](https://github.com/my-links/my-links/commit/3591d032c246d4998f92f110701a8b83df869a80))

## [3.3.0](https://github.com/my-links/my-links/compare/3.2.0...3.3.0) (2025-11-09)

### Features

- add api controllers and routes for browser extension ([208f2c6](https://github.com/my-links/my-links/commit/208f2c631f4720f56913974549b74d659dd680f2))
- add user token management ([d00b6b9](https://github.com/my-links/my-links/commit/d00b6b9edda7865736af658e3766031eba22ae36))
- allow adding links via ip ([1c81a6a](https://github.com/my-links/my-links/commit/1c81a6a86fecdda3c0ed555a8f61acfb9982a0ec))
- create dedicated settings page instead of creating many modals ([376e9e3](https://github.com/my-links/my-links/commit/376e9e32c38f652a9a168b28e48b57bd457dd70f))

## [3.2.0](https://github.com/my-links/my-links/compare/3.1.3...3.2.0) (2025-08-21)

### Features

- add multiple way to show collections and links ([4ef2b63](https://github.com/my-links/my-links/commit/4ef2b639b603e3b91820a17671ca60af109e3d0f))
- show collection's favorité links first ([ac0605c](https://github.com/my-links/my-links/commit/ac0605caf597788304123262b67115c8a4bf3a89))
- stop force redirect to create collection form ([23ad1fd](https://github.com/my-links/my-links/commit/23ad1fda75773c542ab230b3f40a9077ca308b59))
- update default layout ([97ba56b](https://github.com/my-links/my-links/commit/97ba56b1e7b4bef53b3e65f5b7b3249dbbc88927))
- update user dropdown items ([d57f3ec](https://github.com/my-links/my-links/commit/d57f3ec4869774a0d469c2f4295fba952b4d16e6))

### Bug Fixes

- add missing collectionId params in collection's form layout ([87ced07](https://github.com/my-links/my-links/commit/87ced07d20dea6e11a438e416a1674a2035540ef))
- app base url shared in inertia config file ([18fe979](https://github.com/my-links/my-links/commit/18fe979069ad04cb6c6ac5a536ad7cfb6e4b07c3))
- collection edit form page component name ([11df241](https://github.com/my-links/my-links/commit/11df24128fcfc9d64f67ccd86a5ddc5913af3dc9))
- hide collection edit link only when activeCollection isnt defined ([3d986bd](https://github.com/my-links/my-links/commit/3d986bd662fd4c67fd4c7c18d00e94ecbd19590e))
- issue when missing exporter layout ([81d02d3](https://github.com/my-links/my-links/commit/81d02d3d80b0866dad8c36340aa5b44796aae46f))
- navbar dashboard link ([a5ddc9e](https://github.com/my-links/my-links/commit/a5ddc9eb55df6797d817d8a7592fee3f0d18c6c4))
- show dashboard link for authenticated users only ([8537eeb](https://github.com/my-links/my-links/commit/8537eeb37591181d26632bf680c1c9b1a03ab4b7))
- tweak default mantine theme ([309cf2c](https://github.com/my-links/my-links/commit/309cf2c9d24cb894278f1e7b003a3d4eb02d8cd8))

## [3.1.3](https://github.com/my-links/my-links/compare/3.1.2...3.1.3) (2025-08-04)

### Features

- reduce collection item size ([a4396dd](https://github.com/my-links/my-links/commit/a4396ddf182e8cbd18257e8a8b0e4eb7346d16d1))

### Bug Fixes

- page transition ([7e7a010](https://github.com/my-links/my-links/commit/7e7a010d5e8b0362f2265ccb217e85924c4df152))

## [3.1.2](https://github.com/my-links/my-links/compare/3.1.1...3.1.2) (2025-07-05)

## [3.1.1](https://github.com/my-links/my-links/compare/3.1.0...3.1.1) (2025-01-21)

### Bug Fixes

- "cannot remove collection" related to unused stuff ([151ac06](https://github.com/my-links/my-links/commit/151ac0602afb6f57541364367f9dcf7a66da47ea))

## [3.1.0](https://github.com/my-links/my-links/compare/3.0.3...3.1.0) (2025-01-03)

### Features

- add asset caching (sw) ([e28d5eb](https://github.com/my-links/my-links/commit/e28d5ebea800ba30f3dc817b35858422256c3345))
- save user theme preference ([2f820bb](https://github.com/my-links/my-links/commit/2f820bb8776c03ab9892e3d766f710cc63876253))

### Bug Fixes

- footer link behaviour ([c46cc1a](https://github.com/my-links/my-links/commit/c46cc1a8fb90b137c33b9b317236d6a155b8370b))

## [3.0.3](https://github.com/my-links/my-links/compare/3.0.2...3.0.3) (2024-11-15)

### Features

- remove SSR for dasboard page ([6005374](https://github.com/my-links/my-links/commit/6005374340f76b5a3fe014890f1096e4aae93517))

### Bug Fixes

- dashboard header wrap when collection's name too large ([eac0c13](https://github.com/my-links/my-links/commit/eac0c135d679090e7b48064ad75338ec50c9f164))
- navbar & footer broken links ([2de2556](https://github.com/my-links/my-links/commit/2de2556a20384c62ae065ae269868e9a5a1be2bd))
- remove forgotten character ([aef2db6](https://github.com/my-links/my-links/commit/aef2db60715933ab252e3c0a94d72d42f8034b3d))

## [3.0.2](https://github.com/my-links/my-links/compare/3.0.1...3.0.2) (2024-11-15)

### Bug Fixes

- collection name not displayed correctly when too large. ([1938f6e](https://github.com/my-links/my-links/commit/1938f6ea233fe8966f141ac60d1719288204c227))
- dep injection missing ([e8aca90](https://github.com/my-links/my-links/commit/e8aca9087093767e06b0ae02e8a97638ab36eb31))

## [3.0.1](https://github.com/my-links/my-links/compare/3.0.0...3.0.1) (2024-11-10)

### Features

- **admin/users:** change default sort ([4c2e9dd](https://github.com/my-links/my-links/commit/4c2e9ddc82cd534ef109229cfa5aff22d3e1de3e))

### Bug Fixes

- scrolling at bottom of page when switching from one page to another ([ea8350b](https://github.com/my-links/my-links/commit/ea8350bb610650c3dcc20b80d3cc85c0e8bd76b7))
- text overflow when collection name is big ([a073fac](https://github.com/my-links/my-links/commit/a073fac47ba12b063ca87b1974bc6d52efc13998))

## [3.0.0](https://github.com/my-links/my-links/compare/2.2.1...3.0.0) (2024-11-09)

### Features

- add collection description and visibility in dashboard header ([d3de34b](https://github.com/my-links/my-links/commit/d3de34bd4158fbd31a1fbaedf238dfe721ad6d1a))
- add footer dashboard ([d796e4d](https://github.com/my-links/my-links/commit/d796e4d38a8f5ff98665e5c86ecb78c5e2fb2758))
- add kbd with shortcut for create collection/link forms ([798ff0f](https://github.com/my-links/my-links/commit/798ff0fbe406a2f9a7f725b55edfb5a3121a0569))
- add link to dashboard (content layout) ([bcad333](https://github.com/my-links/my-links/commit/bcad33378312db85750c8bb3bb593c8b1c9a63e5))
- add new language switcher ([1da9f0b](https://github.com/my-links/my-links/commit/1da9f0baf46133ee50f4a6831f26fa8b21abe43a))
- add new page transition ([bce00c7](https://github.com/my-links/my-links/commit/bce00c7855055c95c71b73757b84bf19ef34d1d4))
- add share button ([276abc4](https://github.com/my-links/my-links/commit/276abc400950ac74f7f23e80d1f0bab80befa234))
- create new dashboard (layout, navbar, list of links) ([757788b](https://github.com/my-links/my-links/commit/757788bf9bc349270d51d08126d87e02064f7789))
- improve link style ([01a21dd](https://github.com/my-links/my-links/commit/01a21ddef855caee31f3b97935a770c0e02102db))
- persist user language ([d68fcd9](https://github.com/my-links/my-links/commit/d68fcd9fc84c982e96ec65efb572a5bae3095f29))
- recreate admin dashboard using mantine ([174a212](https://github.com/my-links/my-links/commit/174a21288a39b5b2633ca81a654bff596d581ed5))
- recreate collection action dropdown ([7fba156](https://github.com/my-links/my-links/commit/7fba15616860f774570a5699fd1e45a20e44a78d))
- recreate collection list/item ([c7c70b1](https://github.com/my-links/my-links/commit/c7c70b17670d479f978e44947fc0c2d2fc7e9b5a))
- recreate favorite list/item ([d01bfae](https://github.com/my-links/my-links/commit/d01bfaeec2de659e24e6682252d495f4e823be4e))
- recreate form collection (layout + create) ([e77b7cc](https://github.com/my-links/my-links/commit/e77b7cc1768cd5e22350daa8a211361b076e751b))
- recreate form link (layout + create) ([d66e92a](https://github.com/my-links/my-links/commit/d66e92adbc1281e34fd6d47f12198997caa58915))
- recreate link action dropdown ([8953b9a](https://github.com/my-links/my-links/commit/8953b9a64eefaed1c228f707d10e144144cf75ae))
- recreate no link component ([4006990](https://github.com/my-links/my-links/commit/40069905fa4e74a95b35e9b7a61adc0e24e64aa5))
- recreate search modal (using mantine/spotlight) ([81f4cd7](https://github.com/my-links/my-links/commit/81f4cd7f87cc366ed4c4103e324d161dabfc72fa))
- recreate shared page ([83c1966](https://github.com/my-links/my-links/commit/83c1966946469678eeada2cb8e2b6ec0fa9cbc06))
- remove login page (temp) ([db578db](https://github.com/my-links/my-links/commit/db578dbe517cf716a2a06763e51dc1f44adb247f))
- use link action dropdown for favorite links ([8b24354](https://github.com/my-links/my-links/commit/8b24354c0e1df44b5da444217ce35ae5772634ce))
- use new form layout for collection/delete ([6d568b1](https://github.com/my-links/my-links/commit/6d568b133f0299f57f547c304b051f72dbe4b7e7))
- use new form layout for collection/edit ([0ce3e3d](https://github.com/my-links/my-links/commit/0ce3e3d39d542d0ab6d90d017b6c44db958a20f9))
- use new form layout for link/delete ([907dda3](https://github.com/my-links/my-links/commit/907dda300ebd4c4a26715265c2c603d22e417e35))
- use new form layout for link/edit ([edc7972](https://github.com/my-links/my-links/commit/edc7972a2f0720a38029696631ea7a187449ffe5))

### Bug Fixes

- dashboard bg color on light theme ([6f807e5](https://github.com/my-links/my-links/commit/6f807e51e830187189d2af28d971bd2210e4ba66))
- disable shortcut when we cant go back to home ([13bff28](https://github.com/my-links/my-links/commit/13bff288761599d7ceb9faa16fbd0ab0119c0c26))
- make dashboard responsive again (instead of taking up all the space) ([41f82a8](https://github.com/my-links/my-links/commit/41f82a8070d2a591467322f863304d5179c94710))
- page transition no longer play when changing collection ([343160f](https://github.com/my-links/my-links/commit/343160f324fd410ccf42dcbb1896d5f78a3a96fc))
- page transition played when switching collection after soft navigation ([9250e5f](https://github.com/my-links/my-links/commit/9250e5f0b41ddc780d54e05c195def20fff93645))
- regretion where google images aren't loaded due to bad referrer policy ([cc1e7b9](https://github.com/my-links/my-links/commit/cc1e7b91c0d65250f302b723444dd53ba1befcae))
- trim values before form validation ([9781363](https://github.com/my-links/my-links/commit/97813632822aac01bceb500d694258ef15999d63))

## [2.2.1](https://github.com/my-links/my-links/compare/2.2.0...2.2.1) (2024-10-07)

### Bug Fixes

- error on admin dashboard when user "last seen" is null ([bc376a7](https://github.com/my-links/my-links/commit/bc376a72ee5f71cc9fe7acbfdab9d14d382f2d8d))

## [2.2.0](https://github.com/my-links/my-links/compare/2.1.3...2.2.0) (2024-10-07)

### Features

- add user last seen field ([c8fb5af](https://github.com/my-links/my-links/commit/c8fb5af44d8150972cde4ed60267e00140cac40b))

## [2.1.3](https://github.com/my-links/my-links/compare/2.1.2...2.1.3) (2024-09-18)

### Bug Fixes

- favorite link and search result styles ([b0e3bfa](https://github.com/my-links/my-links/commit/b0e3bfa0f678fd01a258d71aa2109b2454d5a095))

## [2.1.2](https://github.com/my-links/my-links/compare/2.1.1...2.1.2) (2024-09-17)

## [2.1.1](https://github.com/my-links/my-links/compare/2.1.0...2.1.1) (2024-09-17)

## [2.1.0](https://github.com/my-links/my-links/compare/2.0.3...2.1.0) (2024-08-30)

### Features

- add dropdown for favorite items ([442a100](https://github.com/my-links/my-links/commit/442a1003bb4fbfbef0fd7dd1f3250e34e9ea9ab0))
- sortable table component ([f0ec6d6](https://github.com/my-links/my-links/commit/f0ec6d6b3d491d2bb648baf6114fa8fb22ae3cfc))

## [2.0.3](https://github.com/my-links/my-links/compare/2.0.2...2.0.3) (2024-07-07)

### Bug Fixes

- (temp) disable xframe check and set same-site cookie to none ([5d08332](https://github.com/my-links/my-links/commit/5d083327a82506b65e2810c669f38c3da73c1e62))
- seed file warnings ([5baa9e1](https://github.com/my-links/my-links/commit/5baa9e1c35605b43e57fc6e668b30bddefec1479))

## [2.0.2](https://github.com/my-links/my-links/compare/2.0.1...2.0.2) (2024-07-06)

### Bug Fixes

- allow iframe ([8b9e74b](https://github.com/my-links/my-links/commit/8b9e74bfe14d3153c01d58a9ed2873393af352a4))

## [2.0.1](https://github.com/my-links/my-links/compare/2.0.0...2.0.1) (2024-07-05)

## [2.0.0](https://github.com/my-links/my-links/compare/1.3.0...2.0.0) (2024-07-02)

### Features

- (re)add favicon scrapper ([817b9ba](https://github.com/my-links/my-links/commit/817b9baafca31bd34535837a1b5a9198965398d9))
- add a search modal using the database (wip) ([56c05f1](https://github.com/my-links/my-links/commit/56c05f1bf67a2313704d88460b7c9a687581abd2))
- add auth via google ([df4185b](https://github.com/my-links/my-links/commit/df4185bd625e6a67d317fa1e28bbca4200d377ee))
- add basic admin dashboard ([202f70b](https://github.com/my-links/my-links/commit/202f70b01085ed970225897bab67314b75da1ab4))
- add collection list ([a58d783](https://github.com/my-links/my-links/commit/a58d78302ee11cf1b9d57f3876dc8e5a42b6e1b0))
- add create collection controller + validator ([602813e](https://github.com/my-links/my-links/commit/602813ec05366141b200005b4a589577295be893))
- add create link form ([73f8c0c](https://github.com/my-links/my-links/commit/73f8c0c513f773e299a607387600bf98d304ef8d))
- add create/edit link form + controller methods ([3c2c5dc](https://github.com/my-links/my-links/commit/3c2c5dcee6d9fc42b9b2c4e2528fda1beee8d8fb))
- add delete collection form and controller method ([50030df](https://github.com/my-links/my-links/commit/50030df9a69a8724439182c057c381dfb7c5a50c))
- add delete link form and controller ([b7d80d8](https://github.com/my-links/my-links/commit/b7d80d844db345db97b29a5d9bc69892410973a9))
- add dropdown component ([0f1dc9b](https://github.com/my-links/my-links/commit/0f1dc9b69c5b799935b3a4ce3ba0443c0caf947a))
- add dropdown for links and collection header ([2f0e1dd](https://github.com/my-links/my-links/commit/2f0e1dd375ea0ea330225a13ee3217a5b8c2b7f1))
- add i18n with type safety ([2cc490b](https://github.com/my-links/my-links/commit/2cc490b6117132dd05a5084918e010fb1f327658))
- add layout transition ([8077f8f](https://github.com/my-links/my-links/commit/8077f8f9c98ae24ce1465dcf127bd6b72bea3511))
- add shared collection page ([8a4f895](https://github.com/my-links/my-links/commit/8a4f895853a5f154f50daefac574d627b74a6b34))
- add theme manager ([3531038](https://github.com/my-links/my-links/commit/3531038321ea7c682a6f02548605883228051814))
- add user dropdown in navbar ([c916b58](https://github.com/my-links/my-links/commit/c916b5870bdba1e430d8ef0c329e190ebdabcb7d))
- add validation for search modal ([09700a1](https://github.com/my-links/my-links/commit/09700a1916c311243b0e032b7aa40789a9a25abd))
- adjust light_theme grey color ([d7381ed](https://github.com/my-links/my-links/commit/d7381ed92a1bfb6d6412b11cd2462366a07f7633))
- apply new style on side-navigation component ([b5cda75](https://github.com/my-links/my-links/commit/b5cda75790822e50d9147f245a32f16819cef3f9))
- bring back legal pages ([3ff7619](https://github.com/my-links/my-links/commit/3ff7619e942d1ac8802eca0c386128d1278db5bf))
- bring back previous home page ([e6803c1](https://github.com/my-links/my-links/commit/e6803c174c257647092c75cd80a6f14bb34ce766))
- create basic settings modal ([a910b89](https://github.com/my-links/my-links/commit/a910b898c72bdca8b9ca86fcc88da804a5c24438))
- create content layout with emotion ([08dcd74](https://github.com/my-links/my-links/commit/08dcd7455f398ed96d0fc98235eef15b21d00cc1))
- create edit collection page ([6b4cfd9](https://github.com/my-links/my-links/commit/6b4cfd9926159198ce629b6f296beddbb0097170))
- create formlayout and create collection form ([9704490](https://github.com/my-links/my-links/commit/97044907ee1ef133f713c418fa01576c9e3aa3c9))
- create settings modal ([53aa7bc](https://github.com/my-links/my-links/commit/53aa7bc22b595fb0673ff388738838c8a528669e))
- create tab and selector components ([8e1e3be](https://github.com/my-links/my-links/commit/8e1e3bea17e31a707ede18cfaf8399c84c668caf))
- improve side nav item style and fix some UI issues ([31b4f22](https://github.com/my-links/my-links/commit/31b4f227727c6df81c60420f8f04322a5a507357))
- migrate from paths constant to new route management system ([57ed2c5](https://github.com/my-links/my-links/commit/57ed2c5e9463a72915204afc6084405787e2fe28))
- recreate dashboard page from previous version ([2cf8c5a](https://github.com/my-links/my-links/commit/2cf8c5ae02d7c768d6c9c719c74b31c439139211))
- rework settings modal ([cdfd092](https://github.com/my-links/my-links/commit/cdfd092489fecbcd3355fa03ee91d608de08983b))
- styling login page ([2ba0ecc](https://github.com/my-links/my-links/commit/2ba0eccc9fcff0f015359c1a121bb5d385af6203))
- use existing translation on all pages ([8176817](https://github.com/my-links/my-links/commit/8176817030f05c9521ce325ee02c8392dc3d59b2))
- use route management system for collections ([905f0ba](https://github.com/my-links/my-links/commit/905f0ba1c7a14742ffdd670820f93f0ad19cc597))

### Bug Fixes

- bad type returned by theme preference endpoint ([c20dd46](https://github.com/my-links/my-links/commit/c20dd4651c78772d249875650bc5fd708ae53078))
- collection migration ([e917b3a](https://github.com/my-links/my-links/commit/e917b3ae2bb538fe8dffa083a370373d60b3231e))
- error when editing collection ([9481b0a](https://github.com/my-links/my-links/commit/9481b0ad7d48fcb9641fd6e5efcc0f10fe43b629))
- missing nextId field for collection forms ([f3f7f62](https://github.com/my-links/my-links/commit/f3f7f6272f84fb6de808bdd3895e6d5d43543226))
- missing PK on each column id ([5f5eece](https://github.com/my-links/my-links/commit/5f5eece627ca3e12a1cf55de655512525559d764))
- prod docker ([f0e64c1](https://github.com/my-links/my-links/commit/f0e64c19fd3e667272fc5f90d80c92a6598218df))
- relations between tables ([31f22d3](https://github.com/my-links/my-links/commit/31f22d382e201a6f1cac72fa1b6e651a527d48b9))
- responsive ([e9ccefd](https://github.com/my-links/my-links/commit/e9ccefd938ac80e454c85392d851dfe514451892))
- some styled for collections and links ([32133be](https://github.com/my-links/my-links/commit/32133be8b06e5422bf3812ec1e06aa4610b4e899))
- some styles ([56aade5](https://github.com/my-links/my-links/commit/56aade52225137ee9e8f6f86ca9b25fd0534f7a9))
- theme persistence ([243984c](https://github.com/my-links/my-links/commit/243984ca66f160397902b1b0dd058e86ef8d3d20))

## [1.3.0](https://github.com/my-links/my-links/compare/1.2.1...1.3.0) (2024-04-14)

### Features

- add category visibility ([194b541](https://github.com/my-links/my-links/commit/194b541143e3fe61777b88590533ca1404b5856c))
- add shared category page ([7ed11fe](https://github.com/my-links/my-links/commit/7ed11fe4aaef062db3707975f537d41c187b94d3))

### Bug Fixes

- some style issues caused by the new visibility badge component ([6b72af9](https://github.com/my-links/my-links/commit/6b72af9e8fb36117852e2bfe1d6636966fc40b2f))

## [1.2.1](https://github.com/my-links/my-links/compare/1.2.0...1.2.1) (2024-04-11)

### Bug Fixes

- link description type in prisma schema ([1068b6e](https://github.com/my-links/my-links/commit/1068b6e057c7b1644f51cb2c6b852c5f8a21c064))

## [1.2.0](https://github.com/my-links/my-links/compare/1.1.0...1.2.0) (2024-04-10)

### Features

- add about page ([a53b600](https://github.com/my-links/my-links/commit/a53b60011175679169bef3e252e040a62d50fb26))
- add optionnal category description ([42a5dab](https://github.com/my-links/my-links/commit/42a5dabec1cd213c8389f4ff25bfd3de8a9b1e1b))

### Bug Fixes

- dev environment variables ([b59b948](https://github.com/my-links/my-links/commit/b59b948ed98f5cb1b6e6e2e6f67a9894e367df95))
- error when removing a category without a previous category ([78915b6](https://github.com/my-links/my-links/commit/78915b6b999f7fffab88686d3b63ca461ad9b688))

## [1.1.0](https://github.com/my-links/my-links/compare/1.0.0...1.1.0) (2024-04-09)

### Features

- add optionnal "required" param on TextBox and Selector inputs ([cf6b873](https://github.com/my-links/my-links/commit/cf6b87306e0009eb87602e17e834e2773d8550a2))
- add optionnal link description ([584489d](https://github.com/my-links/my-links/commit/584489dbb9f8c6dc33ab219e1bf9aa6b5cce11a4))

## [1.0.0](https://github.com/my-links/my-links/compare/e914da7f2b5864bb4a4d717a87a38bec7613dc00...1.0.0) (2024-03-27)

### Features

- add "goto create link/category" keybinds ([935b69e](https://github.com/my-links/my-links/commit/935b69eee83e20a401946f19fd7434d614e7c0fe))
- add autofocus input form create category ([d055387](https://github.com/my-links/my-links/commit/d0553873638000683076e3e37183d83366596adb))
- add burger menu + add link btn ([0e544c2](https://github.com/my-links/my-links/commit/0e544c2ea680319e5dd142d598dbcb830449a351))
- add credits ([12a8982](https://github.com/my-links/my-links/commit/12a898232e523077fbfda79585136580768592f5))
- add favorite link btn ([1e3264e](https://github.com/my-links/my-links/commit/1e3264e2a088cb0ad713f52588716f3e834d6001))
- add folder icon + recenter sidemenu scroll when navigating ([67172bf](https://github.com/my-links/my-links/commit/67172bfa98af06acd24dae271ab10906c52558b7))
- add links count ([01c3a2d](https://github.com/my-links/my-links/commit/01c3a2d90f5d1e7fa6b93b94c75f926dc99b19df))
- add OG description + sitemap / robots.txt ([db5fef0](https://github.com/my-links/my-links/commit/db5fef08fcd3fba3f5f15c1631a7218b98abff93))
- add privacy & terms links index page ([557aa44](https://github.com/my-links/my-links/commit/557aa4444c2796b49beea43e84a47ec026e5b530))
- add search item cursor ([2612545](https://github.com/my-links/my-links/commit/261254576bc0dd28eb63dd8a202e3bd0be9c5603))
- add search modal ([91f2173](https://github.com/my-links/my-links/commit/91f21737642499f787f863e3acfec821f1f93b52))
- add search modal filter with persistence ([69b34e8](https://github.com/my-links/my-links/commit/69b34e824f93fde3a804870f540820a23f727769))
- add search modal mobile ([b2a6b36](https://github.com/my-links/my-links/commit/b2a6b3605b3dfe0475d9babeef0d8b3d51f1f0e7))
- add settings modal ([20a0f86](https://github.com/my-links/my-links/commit/20a0f861187fbc664c1af83b662abc7d38a0fa9e))
- add some animation ([95c5ca7](https://github.com/my-links/my-links/commit/95c5ca78bc70be1122ab126610870bd99b17bc60))
- add support for domain without extension (ie: localhost) ([d4af0b4](https://github.com/my-links/my-links/commit/d4af0b4a4df2ad9b2c62ea4216fa69d95a5724bb))
- add usercard home page (temp?) ([ab3b804](https://github.com/my-links/my-links/commit/ab3b80491866692937ea5bf1ce748ee275b0b9f0))
- admin dashboard ([cd7ad1f](https://github.com/my-links/my-links/commit/cd7ad1f3d37e4b5cf5adc45813ce194faae276bc))
- api handler ([cfcc99f](https://github.com/my-links/my-links/commit/cfcc99fa6b4e0e9c6e0acfdaa8aa8db83190f078))
- change some icons ([8b86fbf](https://github.com/my-links/my-links/commit/8b86fbfd7fcd133b83c3c6feba27e93e60cd9971))
- create functions to get user specific data ([a6f32e8](https://github.com/my-links/my-links/commit/a6f32e852cc7335d7244006d1e77f795b33fc233))
- create user if there's no user in db ([8e893cc](https://github.com/my-links/my-links/commit/8e893ccc790c34009cef6e493a0e4ddb84433524))
- disable link to home page when user has 0 category ([d9757bd](https://github.com/my-links/my-links/commit/d9757bdc18848631c54108468a697006e21c2d57))
- escape shortcut redirect to home page + page transition for all pages ([c40bca2](https://github.com/my-links/my-links/commit/c40bca2460f8cda3ce8f9b3285b727dd43a8f65c))
- favicon api always return an image ([f5c406a](https://github.com/my-links/my-links/commit/f5c406a84c06c26db578b1716a44a7f0578ab4f5))
- first form field auto focused ([05ab09f](https://github.com/my-links/my-links/commit/05ab09f7bc80a46c922619ee9bccca18c52b1dab))
- improve & fix some styles ([3497c3f](https://github.com/my-links/my-links/commit/3497c3f92d1316d9b4aa1c2f5aadccf06b329c34))
- improve search ([cfba05c](https://github.com/my-links/my-links/commit/cfba05c58d6e0a3ef941ce7049fad47a7bcdec9b))
- make all forms responsive ([1ae657d](https://github.com/my-links/my-links/commit/1ae657daa8d520b602df9bc3fb0210e41810a9d1))
- modal enter & exit transitions ([050c4e2](https://github.com/my-links/my-links/commit/050c4e2324bf1c0c086ec34d2dfbfc3801f30d45))
- more verbose favicon console.log ([cc81ce2](https://github.com/my-links/my-links/commit/cc81ce26fb7fe567a5ae89cb93501e2bc47ca815))
- open search modal when query param is defined ([f7fed8b](https://github.com/my-links/my-links/commit/f7fed8bde467039c6a7eba569f788b2a00e129b6))
- privacy page with translation ([6d5afee](https://github.com/my-links/my-links/commit/6d5afee4f46e1f1ecbc32e40e6ed2e06e1852b35))
- pwa support ([d7fe801](https://github.com/my-links/my-links/commit/d7fe801aa2c0d5fcaebb40a00181a18e4e6837ea))
- redesign login page ([24e8800](https://github.com/my-links/my-links/commit/24e8800f202513db1597df2e5e4d92504c64c860))
- redirect to home page if already connected ([e1ff4ec](https://github.com/my-links/my-links/commit/e1ff4ec7ad7bca9277e3a352eabd5db8a04b9381))
- remove category quick actions in side menu & add opened icon when category's active ([15eae9a](https://github.com/my-links/my-links/commit/15eae9a39ab0738328a32ed9f583e420937b924c))
- removing registration restrictions ([5bdd42a](https://github.com/my-links/my-links/commit/5bdd42afdb494fcf0a78e4fa603b292fe51e1ae0))
- rework login page ([f44d1c2](https://github.com/my-links/my-links/commit/f44d1c2d335818ce586f581f2f5787495fa4efd7))
- search modal items centered & direction set to column ([f6ef55a](https://github.com/my-links/my-links/commit/f6ef55ace08de8571857227616db976e6e861be8))
- session expiration delay set to default ([1a8e4e7](https://github.com/my-links/my-links/commit/1a8e4e72700ca6db7ba1ed731b8a7060c0af4f15))
- settings modal add profile and lang selector ([fe288c6](https://github.com/my-links/my-links/commit/fe288c69b1cd0f40b1ad2965fc8ffff5ea2350b9))
- show category header even without link ([a4e8c47](https://github.com/my-links/my-links/commit/a4e8c47f76c0bd513a67223eda20c39c8e318c99))
- signin page responsive ([727b660](https://github.com/my-links/my-links/commit/727b66064e0974907c2f8a81a1a89844018ed95d))
- store avatar and user name ([f55d467](https://github.com/my-links/my-links/commit/f55d467f97c858babf12ecb34aff7075bdaff458))
- terms of use page ([371eea8](https://github.com/my-links/my-links/commit/371eea85dcbb1c7cdcea6008a6153fff2cd98bde))
- update favicon ([123ef63](https://github.com/my-links/my-links/commit/123ef630fc48f2749200a73737861d937306c3fd))
- update input/button style + add react-toggle ([406bf28](https://github.com/my-links/my-links/commit/406bf281b0b69d8b880dc5b7fdb6265746efb863))
- use react select in search modal filter ([9d59c3b](https://github.com/my-links/my-links/commit/9d59c3b993c26af0d50078c47fb04f69a590a767))
- use react-select in lang-selector component ([e8f2d80](https://github.com/my-links/my-links/commit/e8f2d80e6a9c687048a0f6bb13ef8886ea091b2c))
- **wip:** add responsive ([d482598](https://github.com/my-links/my-links/commit/d482598203b5ac3751442f967e5c54d8180d86e9))
- **wip:** add support for multi user in instance ([e7e7e0c](https://github.com/my-links/my-links/commit/e7e7e0c9501e9f88d04f0709aa7200e17e9e6604))
- **wip:** create models to access db data ([a89fa47](https://github.com/my-links/my-links/commit/a89fa471e09ec8a14364ea1c9a8e1f2dc4578f57))

### Bug Fixes

- "cannot find module" - prisma ([3a6f8a8](https://github.com/my-links/my-links/commit/3a6f8a8cd61a31c5825e137bec50fc12491c0b4b))
- add next.config.js file to docker context ([0bb5a3b](https://github.com/my-links/my-links/commit/0bb5a3bcc3916b0147ce82543108bc80b71a8f59))
- again docker compose ([18747ae](https://github.com/my-links/my-links/commit/18747ae0f8642670455881f4ab71e560993ddfe3))
- another fix for docker compose & makefile ([f68bb22](https://github.com/my-links/my-links/commit/f68bb22a01e7d7704f2ccf66632356677677e4a0))
- api favicon call ([1feb551](https://github.com/my-links/my-links/commit/1feb551093c5ceaf35dd6c8d0f4084cbe0974e8c))
- apply reset style for ul ([7a7d496](https://github.com/my-links/my-links/commit/7a7d496dfe6fd95b1a3fc267162f66b58f7d3287))
- cookies cannot be used by browser extension ([98f1dc4](https://github.com/my-links/my-links/commit/98f1dc4e31c59b8a47574920bc94dbefa4350114))
- docker compose & makefile ([9db1f93](https://github.com/my-links/my-links/commit/9db1f93d05af83a43478c5c5d92d13b582ac5b6b))
- edit category not working when updating name ([115ff3e](https://github.com/my-links/my-links/commit/115ff3e2f8b3c5d52801d857f3385ea911dfd2ba))
- env var exposed in next.config are undefined ([11ac5f4](https://github.com/my-links/my-links/commit/11ac5f4b0522ac3001993bf7ff9484d83a7f1e59))
- error not correctly handled client side ([c0b65bb](https://github.com/my-links/my-links/commit/c0b65bb7d71d8f3093bfdab3768b99c6e5fe5fce))
- error when user has no category ([2d8cf41](https://github.com/my-links/my-links/commit/2d8cf41a83dc71df1c838f411e774226b68b8e27))
- favicon api ([d16c61f](https://github.com/my-links/my-links/commit/d16c61ff5a5d007b1f8d786b3d7a6ad7df841986))
- index page responsive ([e0a2398](https://github.com/my-links/my-links/commit/e0a2398e7848ad4f0aa1cbce39c1b7e7238eb782))
- internal server error when unauthenticated user goes to legal pages ([20b0eac](https://github.com/my-links/my-links/commit/20b0eac03a9adcb946da24c92964cebbf399fc37))
- link name already used in different category ([e914da7](https://github.com/my-links/my-links/commit/e914da7f2b5864bb4a4d717a87a38bec7613dc00))
- links rerender when switching category ([ab462aa](https://github.com/my-links/my-links/commit/ab462aafd4628168dc547653af568b1ad8b6e0ae))
- localhost url in login scss file ([dee63bd](https://github.com/my-links/my-links/commit/dee63bda954c6a5f55413bb32f4611f366392ec9))
- login form weird popin animation ([f562b7c](https://github.com/my-links/my-links/commit/f562b7c433f8a719618bbeff9dd27fe32d0430ef))
- long link & cat name breaking layout ([b38b0ab](https://github.com/my-links/my-links/commit/b38b0ab390289d45fc58487a2d5de51c4e39b655))
- message manager colors + links rerender when switching category ([01bdeb7](https://github.com/my-links/my-links/commit/01bdeb7d73f06f3155bea41b8c548cf962184b8d))
- no link label flicking ([e19bffb](https://github.com/my-links/my-links/commit/e19bffb7925f769ea50da8ee47bf884aeb44431d))
- no link label not centered ([eb6db0e](https://github.com/my-links/my-links/commit/eb6db0ec42437b7fcb5d25b998a1b9c7298cb2f5))
- no link label not centered ([304c122](https://github.com/my-links/my-links/commit/304c1223eeb17add24213ade0815afd66fae2894))
- redirect user if not logged in ([9d4c3cb](https://github.com/my-links/my-links/commit/9d4c3cbdd90c3db96b73cab1eaa7ff90c826a312))
- **revert:** html & body overflow ([472a6bb](https://github.com/my-links/my-links/commit/472a6bb325f63b0f06450f17db6d3edf46b58fa6))
- selector child not rendered correctly ([4a7d539](https://github.com/my-links/my-links/commit/4a7d5392ad9e5426d72b9192dd5338880f903963))
- some cases where favicon are broken ([c35eb67](https://github.com/my-links/my-links/commit/c35eb678901e451fcc2b178d1717509ae0201b0e))
- Too many prisma client created ([339b651](https://github.com/my-links/my-links/commit/339b651dfc93631746c6bb6e0df4d5686aac48da))
- window is not defined (server) ([6e3b226](https://github.com/my-links/my-links/commit/6e3b2263b0fa4464dad9d4997abc6f6a5804797c))
- wrong next config remote pattern ([5fe58c4](https://github.com/my-links/my-links/commit/5fe58c44d507d129063cfacfa1f917c53943e7c8))
- wrong search link ([35a65e5](https://github.com/my-links/my-links/commit/35a65e5cce0ef63cdfde497c91affda3dca7bd66))
- wrong table name in sql query ([f3e0b8a](https://github.com/my-links/my-links/commit/f3e0b8afaee55685fafa1fd6378800ff4fef951a))

### Reverts

- Revert "Add: tRPC + register on first time login" ([056a398](https://github.com/my-links/my-links/commit/056a398f25fd455e8e329a6eb00929aee7770dbd))
