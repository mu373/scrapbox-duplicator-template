# Scrapbox Duplicator Template

Deno project that duplicates Scrapbox pages between projects.

## Pre-push checks

Run these before pushing (matches CI in `.github/workflows/ci.yml`):

```sh
deno fmt --check .
deno lint .
deno check *.ts
```

Or fix formatting automatically with `deno fmt .` then run the rest.
