import random
from functools import reduce

# Use a large prime number for finite field arithmetic
PRIME = 208351617316091241234326746312124448251235562226470491514186331217050270460481

def eval_polynomial(coeffs, x):
    """Evaluate polynomial at x with given coefficients."""
    return sum([coeff * pow(x, i, PRIME) for i, coeff in enumerate(coeffs)]) % PRIME

def generate_shares(secret, n, k):
    """Generate n shares with threshold k from secret using a random polynomial."""
    # Random coefficients for the polynomial, where coeffs[0] is the secret
    coeffs = [secret] + [random.randrange(0, PRIME) for _ in range(k - 1)]
    shares = [(x, eval_polynomial(coeffs, x)) for x in range(1, n + 1)]
    return shares

def lagrange_interpolation(x, x_s, y_s):
    """Reconstruct the secret using Lagrange interpolation at x = 0."""
    def PI(vals):  # product of inputs
        return reduce(lambda a, b: a * b % PRIME, vals, 1)

    total = 0
    k = len(x_s)
    for i in range(k):
        xi, yi = x_s[i], y_s[i]
        li = PI([(x - x_s[m]) * pow(xi - x_s[m], -1, PRIME) % PRIME
                 for m in range(k) if m != i])
        total += yi * li
        total %= PRIME
    return total

def reconstruct_secret(shares):
    """Reconstruct the secret from given shares."""
    x_s, y_s = zip(*shares)
    return lagrange_interpolation(0, x_s, y_s)

# ==== 🔧 Example usage ====

secret = 123456789987654321
n = 5      # total shares
k = 3      # threshold shares to reconstruct

# Split the secret
shares = generate_shares(secret, n, k)
print("Generated Shares:")
for share in shares:
    print(f"Share {share[0]}: {share[1]}")

# Pick any k shares for reconstruction
subset = shares[:k]
recovered_secret = reconstruct_secret(subset)

print("\nRecovered Secret:", recovered_secret)
assert recovered_secret == secret
