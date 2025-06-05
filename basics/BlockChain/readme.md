# 🔐 Shamir's Secret Sharing Scheme in Python

A simple Python implementation of Shamir's Secret Sharing for secure splitting and reconstruction of secrets using modular arithmetic over a large finite field.

---

## ✨ Features

- Securely splits a secret into `n` parts (shares)
- Requires only `k` shares (threshold) to reconstruct the original secret
- Uses finite field arithmetic and **Lagrange interpolation**
- Easy to understand and extend
- Fully self-contained — no external libraries needed

---

## 📜 How It Works

- A random polynomial of degree `k - 1` is generated.
- The secret is set as the polynomial’s constant term (`a₀`).
- The function evaluates this polynomial at `n` different `x` values to create `n` unique shares.
- Any `k` of those shares can be used to reconstruct the secret via **Lagrange interpolation** at `x = 0`.

---

## 🔢 Example

```python
secret = 123456789987654321
n = 5      # total number of shares
k = 3      # threshold to reconstruct the secret

shares = generate_shares(secret, n, k)
# Output: Share 1: <val>, Share 2: <val>, ...

subset = shares[:k]
recovered_secret = reconstruct_secret(subset)
# Output: Recovered Secret: 123456789987654321
🔧 Functions
generate_shares(secret, n, k)
→ Returns a list of n shares from the secret using a k-threshold scheme.

reconstruct_secret(shares)
→ Reconstructs the original secret using any k valid shares.

eval_polynomial(coeffs, x)
→ Computes polynomial value at x.

lagrange_interpolation(x, x_s, y_s)
→ Reconstructs the secret at x=0 using Lagrange basis polynomials.

