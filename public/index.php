<?php
// Production error handling
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 'Off');
ini_set('log_errors', 'On');

// Security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Permissions-Policy: geolocation=(), microphone=(), camera=()");

$request = $_SERVER['REQUEST_URI'];
$base_dir = __DIR__;

// Remove query string
$request = strtok($request, '?');

// Handle trailing slashes
$request = rtrim($request, '/');
if (empty($request)) {
    $request = '/index.html';
}

// Security check for path traversal
$normalized_path = realpath($base_dir . $request);
if ($normalized_path === false || strpos($normalized_path, $base_dir) !== 0) {
    header("HTTP/1.1 403 Forbidden");
    exit("Access denied");
}

// Serve static files directly
if (file_exists($base_dir . $request) && is_file($base_dir . $request)) {
    $extension = pathinfo($request, PATHINFO_EXTENSION);
    switch ($extension) {
        case 'html':
            header('Content-Type: text/html; charset=utf-8');
            break;
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'json':
            header('Content-Type: application/json');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'gif':
            header('Content-Type: image/gif');
            break;
        case 'ico':
            header('Content-Type: image/x-icon');
            break;
        case 'woff':
            header('Content-Type: font/woff');
            break;
        case 'woff2':
            header('Content-Type: font/woff2');
            break;
        case 'ttf':
            header('Content-Type: font/ttf');
            break;
    }
    readfile($base_dir . $request);
    exit;
}

// For Next.js dynamic routes, serve index.html
if (file_exists($base_dir . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($base_dir . '/index.html');
} else {
    // Handle 404
    http_response_code(404);
    echo "404 Not Found";
}
