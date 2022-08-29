// Should be true if loading web page from http://localhost/ or https
console.log(`[main] window.isSecureContext = ${window.isSecureContext}`);

// Should be true if required response headers are set
console.log(`[main] window.crossOriginIsolated = ${window.crossOriginIsolated}`);
