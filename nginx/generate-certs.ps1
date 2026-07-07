# Create self-signed SSL certificates for localhost Nginx testing

$CertDir = "$PSScriptRoot/certs"
if (!(Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir | Out-Null
}

$CrtFile = "$CertDir/localhost.crt"
$KeyFile = "$CertDir/localhost.key"

# Try to find openssl.exe in standard locations
$OpenSSL = Get-Command openssl -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (!$OpenSSL) {
    $GitPaths = @(
        "C:\Program Files\Git\usr\bin\openssl.exe",
        "C:\Program Files\Git\mingw64\bin\openssl.exe",
        "C:\Program Files (x86)\Git\usr\bin\openssl.exe"
    )
    foreach ($path in $GitPaths) {
        if (Test-Path $path) {
            $OpenSSL = $path
            break
        }
    }
}

if ($OpenSSL) {
    Write-Host "Found OpenSSL at: $OpenSSL"
    # Generate self-signed cert using OpenSSL
    & $OpenSSL req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $KeyFile -out $CrtFile `
        -subj "/C=VN/ST=Hanoi/L=Hanoi/O=NextflowOS/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" 2>&1
} else {
    Write-Host "OpenSSL not found. Attempting PowerShell New-SelfSignedCertificate..."
    # PowerShell native self-signed certificate (note: need to convert to PEM format)
    $Cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -FriendlyName "Nextflow OS Local SSL"
    
    # Export certificate (DER to PEM)
    $certBytes = $Cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certBase64 = [System.Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)
    
    $pemCert = @"
-----BEGIN CERTIFICATE-----
$certBase64
-----END CERTIFICATE-----
"@
    $pemCert | Out-File -FilePath $CrtFile -Encoding ascii
    
    Write-Warning "PowerShell native export only exported the public certificate ($CrtFile). You will need a matching private key ($KeyFile) in PEM format."
    Write-Warning "Please install Git or OpenSSL for full certificate and key generation."
}

if (Test-Path $CrtFile) {
    Write-Host "✅ Self-signed SSL Certificate generated successfully at: $CrtFile"
}
