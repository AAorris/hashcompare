# hashcompare

Tests some hash functions for uniform distribution of random IDs.

Hashes:
- xxhash32
- fnv1a (modified)

## Comparisons

- Chi-squared (lower is more uniform)
- Kolmogorov-Smirnov (lower is more uniform)

Test samples in the UI accumulate into a beta distribution. Since we run a finite number of tests,
we don't know the true probability that the hash function produces a uniform distribution. Instead,
the beta distribution can show us a range of probability values, and a density value for each probability.