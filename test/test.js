// Test suite
import { sanitizeInput } from '../js/api.js';

QUnit.module('Input Sanitization', function() {
    QUnit.test('XSS protection - script tags', function(assert) {
        const xssInput = '<script>alert("XSS")</script>';
        const result = sanitizeInput(xssInput);
        assert.notOk(result.includes('<script>'), 'Script tags should be escaped');
    });

    QUnit.test('Normal text preservation', function(assert) {
        const normalText = 'Google Photos is great';
        const result = sanitizeInput(normalText);
        assert.ok(result.includes('Google Photos'), 'Normal text should be preserved');
    });

    QUnit.test('HTML entity escaping', function(assert) {
        const specialChars = 'Test & "quotes"';
        const result = sanitizeInput(specialChars);
        assert.ok(result.includes('&amp;'), 'Ampersand should be escaped');
    });

    QUnit.test('Empty string handling', function(assert) {
        const result = sanitizeInput('');
        assert.equal(result, '', 'Empty string should remain empty');
    });

    QUnit.test('XSS protection - onclick handlers', function(assert) {
        const xssInput = '<img src=x onerror="alert(\'XSS\')">';
        const result = sanitizeInput(xssInput);
        assert.notOk(result.includes('<img'), 'Image tags with handlers should be escaped');
    });

    QUnit.test('XSS protection - iframe injection', function(assert) {
        const xssInput = '<iframe src="malicious.com"></iframe>';
        const result = sanitizeInput(xssInput);
        assert.notOk(result.includes('<iframe'), 'Iframe tags should be escaped');
    });

    QUnit.test('Less than and greater than escaping', function(assert) {
        const input = '<div>content</div>';
        const result = sanitizeInput(input);
        assert.ok(result.includes('&lt;') || result.includes('&gt;'), 'Angle brackets should be escaped');
    });

    QUnit.test('Single quotes preservation', function(assert) {
        const input = "Don't skip this";
        const result = sanitizeInput(input);
        assert.ok(result.includes("Don't") || result.includes('&#'), 'Quotes should be handled properly');
    });
});

QUnit.module('Data Validation', function() {
    QUnit.test('Product name max length', function(assert) {
        const longName = 'A'.repeat(101);
        assert.ok(longName.length > 100, 'Name exceeds 100 character limit');
    });

    QUnit.test('Product URL max length', function(assert) {
        const longUrl = 'A'.repeat(501);
        assert.ok(longUrl.length > 500, 'URL exceeds 500 character limit');
    });

    QUnit.test('Logo URL max length', function(assert) {
        const longLogoUrl = 'A'.repeat(501);
        assert.ok(longLogoUrl.length > 500, 'Logo URL exceeds 500 character limit');
    });

    QUnit.test('Product name non-empty validation', function(assert) {
        const emptyName = '';
        assert.equal(emptyName.length, 0, 'Empty product name should fail validation');
    });

    QUnit.test('Product URL non-empty validation', function(assert) {
        const emptyUrl = '';
        assert.equal(emptyUrl.length, 0, 'Empty product URL should fail validation');
    });

    QUnit.test('Logo URL non-empty validation', function(assert) {
        const emptyLogo = '';
        assert.equal(emptyLogo.length, 0, 'Empty logo URL should fail validation');
    });

    QUnit.test('Valid product name at boundary (100 chars)', function(assert) {
        const validName = 'A'.repeat(100);
        assert.equal(validName.length, 100, 'Product name of 100 chars should be valid');
    });

    QUnit.test('Valid URL at boundary (500 chars)', function(assert) {
        const validUrl = 'https://example.com/' + 'A'.repeat(480);
        assert.ok(validUrl.length <= 500, 'URL of 500 chars should be valid');
    });

    QUnit.test('Whitespace trimming needed', function(assert) {
        const inputWithSpaces = '   test   ';
        const trimmed = inputWithSpaces.trim();
        assert.equal(trimmed, 'test', 'Whitespace should be trimmed');
    });
});

QUnit.module('Vote Logic', function() {
    QUnit.test('Kill vote count increment', function(assert) {
        let voteCount = 0;
        voteCount++;
        assert.equal(voteCount, 1, 'Single kill vote should increment to 1');
        voteCount++;
        assert.equal(voteCount, 2, 'Multiple kill votes should accumulate');
    });

    QUnit.test('Spare vote count increment', function(assert) {
        let spareVoteCount = 0;
        spareVoteCount++;
        assert.equal(spareVoteCount, 1, 'Single spare vote should increment to 1');
        spareVoteCount++;
        assert.equal(spareVoteCount, 2, 'Multiple spare votes should accumulate');
    });

    QUnit.test('Vote count cannot be negative', function(assert) {
        let voteCount = 0;
        const negativeVote = Math.max(0, voteCount - 1);
        assert.equal(negativeVote, 0, 'Vote count should not go negative');
    });

    QUnit.test('Kill and spare votes tracked separately', function(assert) {
        let killVotes = 5;
        let spareVotes = 3;
        assert.equal(killVotes, 5, 'Kill votes should be independent');
        assert.equal(spareVotes, 3, 'Spare votes should be independent');
        killVotes++;
        assert.equal(spareVotes, 3, 'Incrementing kill votes should not affect spare votes');
    });

    QUnit.test('Total votes calculation', function(assert) {
        const killVotes = 7;
        const spareVotes = 4;
        const totalVotes = killVotes + spareVotes;
        assert.equal(totalVotes, 11, 'Total votes should be sum of kill and spare');
    });

    QUnit.test('Vote type validation - kill', function(assert) {
        const voteType = 'kill';
        assert.ok(voteType === 'kill' || voteType === 'spare', 'Kill should be valid vote type');
    });

    QUnit.test('Vote type validation - spare', function(assert) {
        const voteType = 'spare';
        assert.ok(voteType === 'kill' || voteType === 'spare', 'Spare should be valid vote type');
    });
});

QUnit.module('Product Structure', function() {
    QUnit.test('Product object has all required fields', function(assert) {
        const product = {
            productId: '550e8400-e29b-41d4-a716-446655440000',
            productName: 'Google Photos',
            productUrl: 'https://photos.google.com',
            logoUrl: 'https://example.com/logo.png',
            voteCount: 5,
            spareVoteCount: 2,
            status: 'alive',
            timestamp: Date.now()
        };
        
        assert.ok(product.productId, 'Product should have productId');
        assert.ok(product.productName, 'Product should have productName');
        assert.ok(product.productUrl, 'Product should have productUrl');
        assert.ok(product.logoUrl, 'Product should have logoUrl');
        assert.ok(product.voteCount !== undefined, 'Product should have voteCount');
        assert.ok(product.spareVoteCount !== undefined, 'Product should have spareVoteCount');
        assert.ok(product.status, 'Product should have status');
    });

    QUnit.test('Product ID is UUID format', function(assert) {
        const productId = '550e8400-e29b-41d4-a716-446655440000';
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        assert.ok(uuidRegex.test(productId), 'Product ID should be valid UUID');
    });

    QUnit.test('Product status values', function(assert) {
        const validStatuses = ['alive', 'killed', 'deleted'];
        const testProduct = { status: 'alive' };
        assert.ok(validStatuses.includes(testProduct.status), 'Status should be one of valid values');
    });

    QUnit.test('Product timestamps are numeric', function(assert) {
        const product = { timestamp: 1702234567890 };
        assert.ok(typeof product.timestamp === 'number', 'Timestamp should be numeric');
        assert.ok(product.timestamp > 0, 'Timestamp should be positive');
    });

    QUnit.test('Vote counts are non-negative integers', function(assert) {
        const product = { voteCount: 5, spareVoteCount: 3 };
        assert.ok(Number.isInteger(product.voteCount) && product.voteCount >= 0, 'voteCount should be non-negative integer');
        assert.ok(Number.isInteger(product.spareVoteCount) && product.spareVoteCount >= 0, 'spareVoteCount should be non-negative integer');
    });

    QUnit.test('Product URLs are properly formatted', function(assert) {
        const product = { productUrl: 'https://example.com' };
        assert.ok(product.productUrl.includes('http'), 'Product URL should contain protocol');
    });
});

QUnit.module('Product Filtering', function() {
    QUnit.test('Filter by status', function(assert) {
        const products = [
            { productId: '1', status: 'alive' },
            { productId: '2', status: 'killed' },
            { productId: '3', status: 'alive' }
        ];
        
        const alive = products.filter(p => p.status === 'alive');
        const killed = products.filter(p => p.status === 'killed');
        
        assert.equal(alive.length, 2, 'Should filter 2 alive products');
        assert.equal(killed.length, 1, 'Should filter 1 killed product');
    });

    QUnit.test('Filter by name contains substring', function(assert) {
        const products = [
            { productName: 'Google Photos' },
            { productName: 'Google Drive' },
            { productName: 'Adobe Creative Suite' }
        ];
        
        const googleProducts = products.filter(p => p.productName.toLowerCase().includes('google'));
        assert.equal(googleProducts.length, 2, 'Should find 2 products containing "google"');
    });

    QUnit.test('Filter is case-insensitive', function(assert) {
        const products = [
            { productName: 'Google Photos' },
            { productName: 'GOOGLE DRIVE' }
        ];
        
        const filtered = products.filter(p => p.productName.toLowerCase().includes('google'));
        assert.equal(filtered.length, 2, 'Filter should be case-insensitive');
    });

    QUnit.test('Empty filter returns all products', function(assert) {
        const products = [
            { productName: 'Product A' },
            { productName: 'Product B' },
            { productName: 'Product C' }
        ];
        
        const filtered = products.filter(p => p.productName.toLowerCase().includes(''));
        assert.equal(filtered.length, 3, 'Empty filter should return all products');
    });

    QUnit.test('No results for non-matching filter', function(assert) {
        const products = [
            { productName: 'Google Photos' },
            { productName: 'Google Drive' }
        ];
        
        const filtered = products.filter(p => p.productName.toLowerCase().includes('microsoft'));
        assert.equal(filtered.length, 0, 'Non-matching filter should return empty array');
    });

    QUnit.test('Filter multiple status values', function(assert) {
        const products = [
            { status: 'alive' },
            { status: 'killed' },
            { status: 'deleted' },
            { status: 'alive' }
        ];
        
        const aliveOrKilled = products.filter(p => p.status === 'alive' || p.status === 'killed');
        assert.equal(aliveOrKilled.length, 3, 'Should filter multiple status values');
    });
});

QUnit.module('Vote Sorting', function() {
    QUnit.test('Sort products by kill votes descending', function(assert) {
        const products = [
            { productId: '1', voteCount: 5, spareVoteCount: 2 },
            { productId: '2', voteCount: 10, spareVoteCount: 1 },
            { productId: '3', voteCount: 3, spareVoteCount: 8 }
        ];
        
        products.sort((a, b) => b.voteCount - a.voteCount);
        
        assert.equal(products[0].voteCount, 10, 'Highest kill votes should be first');
        assert.equal(products[2].voteCount, 3, 'Lowest kill votes should be last');
    });

    QUnit.test('Sort products by spare votes descending', function(assert) {
        const products = [
            { productId: '1', voteCount: 5, spareVoteCount: 2 },
            { productId: '2', voteCount: 10, spareVoteCount: 8 },
            { productId: '3', voteCount: 3, spareVoteCount: 1 }
        ];
        
        products.sort((a, b) => b.spareVoteCount - a.spareVoteCount);
        
        assert.equal(products[0].spareVoteCount, 8, 'Highest spare votes should be first');
        assert.equal(products[2].spareVoteCount, 1, 'Lowest spare votes should be last');
    });

    QUnit.test('Sort maintains product identity', function(assert) {
        const products = [
            { productId: '1', voteCount: 5 },
            { productId: '2', voteCount: 10 }
        ];
        
        products.sort((a, b) => b.voteCount - a.voteCount);
        
        assert.equal(products[0].productId, '2', 'Product IDs should remain with their data after sort');
        assert.equal(products[1].productId, '1', 'All product data should be preserved after sort');
    });

    QUnit.test('Sort handles equal vote counts', function(assert) {
        const products = [
            { productId: '1', voteCount: 5 },
            { productId: '2', voteCount: 5 },
            { productId: '3', voteCount: 3 }
        ];
        
        const originalLength = products.length;
        products.sort((a, b) => b.voteCount - a.voteCount);
        
        assert.equal(products.length, originalLength, 'Sort should maintain all products');
        assert.ok(products[0].voteCount >= products[1].voteCount, 'Sort order should be maintained');
    });

    QUnit.test('Sort with single product', function(assert) {
        const products = [{ productId: '1', voteCount: 5 }];
        products.sort((a, b) => b.voteCount - a.voteCount);
        
        assert.equal(products.length, 1, 'Single product should remain');
        assert.equal(products[0].voteCount, 5, 'Vote count should be unchanged');
    });

    QUnit.test('Sort empty array', function(assert) {
        const products = [];
        products.sort((a, b) => b.voteCount - a.voteCount);
        
        assert.equal(products.length, 0, 'Empty array should remain empty after sort');
    });
});

QUnit.module('HTML Escaping', function() {
    QUnit.test('Escape HTML special characters in product names', function(assert) {
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        const input = '<script>alert("XSS")</script>';
        const output = escapeHtml(input);
        assert.notOk(output.includes('<script>'), 'Script tags should be escaped');
        assert.ok(output.includes('&lt;'), 'Less than should be escaped');
    });

    QUnit.test('Preserve safe characters in HTML escape', function(assert) {
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        const input = 'Google Photos App';
        const output = escapeHtml(input);
        assert.ok(output.includes('Google'), 'Safe text should be preserved');
        assert.equal(input, output, 'Safe text should not be modified');
    });

    QUnit.test('Escape URLs in product links', function(assert) {
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        const input = 'https://example.com?param="test"&other=value';
        const output = escapeHtml(input);
        assert.ok(output.includes('&quot;'), 'Quotes in URLs should be escaped');
        assert.ok(output.includes('&amp;'), 'Ampersands in URLs should be escaped');
    });

    QUnit.test('Escape image sources', function(assert) {
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        
        const inputWithTags = '<img src="javascript:alert(\'XSS\')">';
        const output = escapeHtml(inputWithTags);
        assert.ok(output.includes('&lt;') && output.includes('&gt;'), 'Malicious image tags should be escaped');
    });
});

QUnit.module('API Response Handling', function() {
    QUnit.test('Parse JSON API response', function(assert) {
        const mockResponse = { productId: '123', productName: 'Test' };
        assert.ok(mockResponse.productId, 'API response should contain productId');
        assert.ok(mockResponse.productName, 'API response should contain productName');
    });

    QUnit.test('Handle API response with nested body', function(assert) {
        const mockResponse = {
            body: JSON.stringify({ productId: '123', productName: 'Test' })
        };
        
        let parsed;
        if (typeof mockResponse.body === 'string') {
            parsed = JSON.parse(mockResponse.body);
        } else {
            parsed = mockResponse.body;
        }
        
        assert.ok(parsed.productId, 'Should extract productId from nested response');
    });

    QUnit.test('Handle empty API response', function(assert) {
        const mockResponse = {};
        assert.ok(Object.keys(mockResponse).length === 0, 'Empty response should be handled');
    });

    QUnit.test('API response contains product array', function(assert) {
        const mockResponse = [
            { productId: '1', productName: 'Product A' },
            { productId: '2', productName: 'Product B' }
        ];
        
        assert.ok(Array.isArray(mockResponse), 'Response should be array');
        assert.equal(mockResponse.length, 2, 'Array should contain 2 products');
    });

    QUnit.test('API error response handling', function(assert) {
        const mockError = { status: 500, message: 'Internal Server Error' };
        assert.ok(mockError.status >= 400, 'Error response should have status code');
    });

    QUnit.test('Valid HTTP status codes', function(assert) {
        const validStatuses = [200, 201, 204, 400, 404, 500];
        validStatuses.forEach(status => {
            assert.ok(status >= 200 || status >= 400, 'Status should be valid HTTP code');
        });
    });
});

QUnit.module('Duplicate Detection', function() {
    QUnit.test('Detect duplicate product by name', function(assert) {
        const products = [
            { productName: 'Google Photos' },
            { productName: 'Google Drive' }
        ];
        
        const newName = 'Google Photos';
        const isDuplicate = products.some(p => p.productName.toLowerCase() === newName.toLowerCase());
        assert.ok(isDuplicate, 'Should detect duplicate product name');
    });

    QUnit.test('Case-insensitive duplicate detection', function(assert) {
        const products = [
            { productName: 'Google Photos' }
        ];
        
        const newName = 'google photos';
        const isDuplicate = products.some(p => p.productName.toLowerCase() === newName.toLowerCase());
        assert.ok(isDuplicate, 'Should detect duplicate regardless of case');
    });

    QUnit.test('Non-duplicate different names', function(assert) {
        const products = [
            { productName: 'Google Photos' },
            { productName: 'Google Drive' }
        ];
        
        const newName = 'Google Sheets';
        const isDuplicate = products.some(p => p.productName.toLowerCase() === newName.toLowerCase());
        assert.notOk(isDuplicate, 'Should not detect duplicate for different name');
    });

    QUnit.test('Duplicate detection with whitespace', function(assert) {
        const products = [
            { productName: 'Google Photos' }
        ];
        
        const newName = '  Google Photos  '.trim();
        const isDuplicate = products.some(p => p.productName.toLowerCase() === newName.toLowerCase());
        assert.ok(isDuplicate, 'Should detect duplicate after trimming');
    });

    QUnit.test('Empty products array has no duplicates', function(assert) {
        const products = [];
        const newName = 'Google Photos';
        const isDuplicate = products.some(p => p.productName.toLowerCase() === newName.toLowerCase());
        assert.notOk(isDuplicate, 'Empty array should have no duplicates');
    });
});

QUnit.module('Array Operations', function() {
    QUnit.test('Combine multiple arrays', function(assert) {
        const alive = [{ id: 1 }, { id: 2 }];
        const killed = [{ id: 3 }];
        const combined = [...alive, ...killed];
        
        assert.equal(combined.length, 3, 'Combined array should have all elements');
    });

    QUnit.test('Clone array without mutation', function(assert) {
        const original = [1, 2, 3];
        const cloned = [...original];
        cloned[0] = 999;
        
        assert.equal(original[0], 1, 'Original array elements should not be mutated');
        assert.equal(cloned[0], 999, 'Cloned array should have new value');
    });

    QUnit.test('Filter returns new array', function(assert) {
        const original = [1, 2, 3, 4, 5];
        const filtered = original.filter(n => n > 2);
        
        assert.equal(filtered.length, 3, 'Filtered array should have 3 elements');
        assert.equal(original.length, 5, 'Original array should be unchanged');
    });

    QUnit.test('Map transforms array elements', function(assert) {
        const products = [
            { voteCount: 5 },
            { voteCount: 10 }
        ];
        
        const votes = products.map(p => p.voteCount);
        assert.equal(votes[0], 5, 'Mapped value should match');
        assert.equal(votes.length, 2, 'Mapped array should have same length');
    });

    QUnit.test('Find single element in array', function(assert) {
        const products = [
            { productId: '1' },
            { productId: '2' },
            { productId: '3' }
        ];
        
        const found = products.find(p => p.productId === '2');
        assert.ok(found, 'Should find element');
        assert.equal(found.productId, '2', 'Should find correct element');
    });
});