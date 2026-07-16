# Refresh Token Rotation & Reuse Detection

## Why not just a long-lived refresh token?

A single long-lived refresh token stored in the `User` row (the original
implementation) can't detect theft: if an attacker copies it, both the
legitimate client and the attacker keep working indefinitely with no way
to tell them apart.

## The scheme

1. **Hashed storage.** Refresh tokens are JWTs, but only their SHA-256 hash
   is stored in the `RefreshToken` table (`utils/jwt.js#hashToken`). A
   database leak alone can't be replayed as a session.

2. **Token families.** Every login/registration starts a new `family`
   (a UUID). Every rotation within that login session keeps the same
   `family` id. This lets us revoke "every token descended from this one
   login" in a single query.

3. **Rotation on every refresh.** `POST /api/auth/refresh-token`:
   - verifies the JWT signature/expiry,
   - hashes it and looks up the matching row,
   - if found and not revoked: marks it `revoked` (recording
     `replacedByTokenHash` for audit purposes) and issues a new
     access + refresh token pair in the same family,
   - the client is expected to store only the newest refresh token.

4. **Reuse detection.** If a refresh token that is already marked
   `revoked` is presented again, that means one of two things:
   - the legitimate client is retrying a request after already rotating
     (a client bug), or
   - an attacker has a copy of an old token and is racing the real client.

   Either way, treating it as fatal is the safe default: the **entire
   token family** is revoked immediately, invalidating every token derived
   from that login, and the user is forced to log in again. This is the
   standard mitigation recommended by the IETF OAuth Security BCP for
   public clients that can't hold a refresh token in a confidential store.

5. **Password reset ⇒ full revocation.** Resetting a password revokes
   every refresh token for that user (`revokeAllForUser`), not just the
   one tied to the current session — otherwise a stolen session would
   survive a password change.

## What this doesn't cover yet

- Refresh tokens are returned in the JSON response body, not an `httpOnly`
  cookie. For a browser client, moving refresh-token storage to a
  `httpOnly`, `Secure`, `SameSite=Strict` cookie would remove the token
  from reach of XSS entirely. `cookie-parser` is already a dependency;
  this is a reasonable next hardening step.
- There's no device/session listing UI yet ("log out of all other
  devices") — the data model (`RefreshToken` per family, per user)
  supports it, but no endpoint exposes it yet.
