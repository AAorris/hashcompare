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

## Beta Distribution

As tests run, there is a counter for passes and failures. The more tests that run, the more
clearly we can estimate the probability of getting a uniform distribution. A graph at the
bottom of the page will show this distribution, peaking at the most likely probability.

To conclude that one hash is better than the other, the reference areas around each distribution must be separated from each other. While there is overlap, there's no clear winner.