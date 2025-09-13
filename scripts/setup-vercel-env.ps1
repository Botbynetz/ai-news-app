<#
  setup-vercel-env.ps1
  Helper script to add environment variables to a Vercel project via the Vercel CLI.

  Usage:
  1. Install Vercel CLI: npm i -g vercel
  2. Run: vercel login
  3. Run this script in PowerShell: .\scripts\setup-vercel-env.ps1

  The script will prompt you to enter values for the variables. It will call
  `vercel env add` interactively for each environment (production/preview/development).

  Note: This script does not store or transmit your secrets elsewhere.
#>

function Prompt-Secret($name) {
  Write-Host "Enter value for $name (leave empty to skip):" -ForegroundColor Yellow
  $value = Read-Host -AsSecureString
  if (-not $value) { return $null }
  # Convert SecureString to plain for CLI usage in this interactive script only
  $ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($value)
  try { [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$vars = @( 'OPENAI_API_KEY', 'NEXT_PUBLIC_SITE_ORIGIN', 'NEWS_API_KEY', 'GNEWS_API_KEY', 'CURRENTS_API_KEY', 'GUARDIAN_API_KEY' )

foreach ($v in $vars) {
  $val = Prompt-Secret $v
  if ([string]::IsNullOrEmpty($val)) { continue }

  Write-Host "Adding $v to Vercel (you will be prompted by vercel CLI)..." -ForegroundColor Cyan
  # Use vercel env add which is interactive; pass the value via stdin is not supported reliably,
  # so we call it and let the CLI prompt for the value. The script helps by reminding the value.
  & vercel env add $v production
  & vercel env add $v preview
  & vercel env add $v development
}

Write-Host "Done. Trigger a deploy in Vercel dashboard or run 'vercel --prod' to deploy." -ForegroundColor Green
