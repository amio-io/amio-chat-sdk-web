# AGENTS.md

## Documentation (amio-docs)

The public product docs live in a separate repo, `amio-docs`. This repo's `README.md` is the source of the docs page `webchat/sdk-reference`: every docs build pulls it from `master`. Keep the README accurate and complete; never edit the generated page in `amio-docs`. The docs only rebuild when `amio-docs` changes, so after a README change lands on `master` run `gh workflow run Deploy -R amio-io/amio-docs`.

Docs repo: https://github.com/amio-io/amio-docs (pages under `src/content/docs/`). Update the docs **in the same ticket**: open a PR to `amio-docs` `main` with the same branch name as this ticket (`PRO-XYZ`) and link it from this repo's PR. Writing rules, screenshots, local checks and deploy are in `AGENTS.md` in `amio-docs`. If you cannot open the docs PR yourself, list the docs pages that need updating in this repo's PR description.
