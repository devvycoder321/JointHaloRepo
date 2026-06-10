# GitHub Repository Security Lockdown Guide

## Current Status

✅ **Unified Repository Created**
- Consolidated both repos into `/workspaces/JointHaloRepo`
- SSH keys copied and configured
- Git remotes configured (origin + haloitservices)
- Dual-push script created

⚠️ **ACTION REQUIRED** - Secure GitHub repositories

---

## STEP-BY-STEP: Lock Down GitHub Access

### PART 1: Generate Public Keys from Private Keys

Run this in the terminal:

```bash
# For HaloIT-Platform repository
ssh-keygen -y -f /workspaces/JointHaloRepo/Secrets-and-Keys/haloit-platform-privatekey > /tmp/haloit-platform.pub

# For Haloitservices repository  
ssh-keygen -y -f /workspaces/JointHaloRepo/Secrets-and-Keys/Haloitservices-privatekey > /tmp/haloitservices.pub

# Display the public keys
echo "=== HaloIT-Platform Public Key ==="
cat /tmp/haloit-platform.pub

echo -e "\n=== Haloitservices Public Key ==="
cat /tmp/haloitservices.pub
```

Copy each public key output - you'll need it in the next steps.

---

### PART 2: Configure HaloIT-Platform Repository

**Repository**: `github.com:replitcompiler-Dev321/HaloIT-Platform`

1. Go to: `https://github.com/replitcompiler-Dev321/HaloIT-Platform/settings/keys`

2. **Remove existing deploy keys** (if any):
   - Find any existing deploy keys
   - Click "Delete" on each one

3. **Add new deploy key**:
   - Click "Add deploy key"
   - **Title**: `haloit-platform-build-key`
   - **Key**: Paste the content from `haloit-platform.pub`
   - **Allow write access**: ✅ CHECK THIS BOX
   - Click "Add key"

4. **Enable Branch Protection**:
   - Go to: `https://github.com/replitcompiler-Dev321/HaloIT-Platform/settings/branches`
   - Under "Branch protection rules", click "Add rule"
   - **Branch name pattern**: `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require branches to be up to date before merging
   - Click "Create"

5. **Disable direct push access** (Optional but recommended):
   - Go to: `https://github.com/replitcompiler-Dev321/HaloIT-Platform/settings/access`
   - Remove SSH key access for individual users
   - Only keep the deploy key

---

### PART 3: Configure Haloitservices Repository

**Repository**: `github.com:HaloAdmin365/Haloitservices365`

1. Go to: `https://github.com/HaloAdmin365/Haloitservices365/settings/keys`

2. **Remove existing deploy keys** (if any):
   - Find any existing deploy keys
   - Click "Delete" on each one

3. **Add new deploy key**:
   - Click "Add deploy key"
   - **Title**: `haloitservices-build-key`
   - **Key**: Paste the content from `haloitservices.pub`
   - **Allow write access**: ✅ CHECK THIS BOX
   - Click "Add key"

4. **Enable Branch Protection**:
   - Go to: `https://github.com/HaloAdmin365/Haloitservices365/settings/branches`
   - Under "Branch protection rules", click "Add rule"
   - **Branch name pattern**: `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require branches to be up to date before merging
   - Click "Create"

5. **Disable direct push access** (Optional but recommended):
   - Go to: `https://github.com/HaloAdmin365/Haloitservices365/settings/access`
   - Remove SSH key access for individual users
   - Only keep the deploy key

---

### PART 4: Test SSH Connectivity

After configuring deploy keys on GitHub, test:

```bash
# Test HaloIT-Platform key
ssh -i ~/.ssh/haloit-platform-key git@github.com

# Test Haloitservices key
ssh -i ~/.ssh/haloitservices-key git@github.com
```

Expected output: `git@github.com: Permission denied (publickey).` (This is fine - it means SSH worked)

---

### PART 5: Make Repositories Private (Optional but Recommended)

**For HaloIT-Platform**:
1. Go to: `https://github.com/replitcompiler-Dev321/HaloIT-Platform/settings`
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Private"
5. Confirm

**For Haloitservices**:
1. Go to: `https://github.com/HaloAdmin365/Haloitservices365/settings`
2. Scroll to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Private"
5. Confirm

---

## After Security Setup

### Test Unified Push

```bash
cd /workspaces/JointHaloRepo

# Test with the dual-push script
./auto_push_dual.sh "test: verify dual-push after security setup"
```

Expected output: ✓ Successfully pushed to all remotes

### Verify Deploy Key Access

```bash
# These should succeed without password
git push origin main
git push haloitservices main
```

---

## Security Best Practices Going Forward

### Daily Operations
- ✅ Use `./auto_push_dual.sh` for commits instead of manual git push
- ✅ Keep SSH keys in `Secrets-and-Keys/` directory
- ✅ Never commit SSH keys to git (already in .gitignore)

### Quarterly Maintenance
1. Rotate SSH keys (generate new ones, update GitHub)
2. Review GitHub security settings
3. Check failed authentication logs
4. Update team access if needed

### Monitoring
- Check GitHub deploy key usage logs
- Monitor for failed authentication attempts
- Review branch protection rules compliance
- Verify auto-deployments trigger correctly

---

## Troubleshooting

### "Permission denied (publickey)" on push

**Solution**: 
- Verify deploy key has "Allow write access" enabled
- Check SSH key file permissions: `chmod 600 ~/.ssh/*-key`
- Confirm SSH config at `~/.ssh/config` is correct

### Only one remote can push

**Solution**:
- Configure deploy keys for BOTH repositories
- Each repo needs its own deploy key
- Different repositories require different SSH keys

### Auto-push script hangs

**Solution**:
- Press Ctrl+C to stop
- Check SSH connectivity: `ssh -vvv git@github.com`
- Verify SSH agent is running: `ssh-add -l`
- Check firewall/network rules

### Changes not appearing on GitHub

**Solution**:
- Run `git status` to verify changes are committed
- Run `git log` to verify commits exist
- Run `git push -v` for verbose output
- Check GitHub Actions/CI logs for deployment issues

---

## Related Documentation

- `UNIFIED_REPO_SETUP.md` - Overall setup explanation
- `auto_push_dual.sh` - Dual-push script
- `.gitignore` - Files excluded from git
- `Secrets-and-Keys/` - SSH key storage

---

## Next Steps

1. ✅ Generate public keys (see PART 1)
2. ⏳ Configure HaloIT-Platform repo (see PART 2)
3. ⏳ Configure Haloitservices repo (see PART 3)
4. ⏳ Test SSH connectivity (see PART 4)
5. ⏳ Make repositories private (see PART 5, optional)
6. ⏳ Test unified push (see "After Security Setup")
7. ⏳ Review security practices (see "Best Practices")

Once complete, your repositories will be:
- Properly secured with deploy keys
- Protected from direct public access
- Able to receive deployments from automated scripts
- Synchronized across both GitHub accounts

---

**Status**: Awaiting manual GitHub configuration (Steps 2-5)
