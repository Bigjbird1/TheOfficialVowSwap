import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';

const PAGES_TO_TEST = [
  {
    name: 'Homepage',
    path: '/'
  },
  {
    name: 'Checkout',
    path: '/checkout'
  },
  {
    name: 'Product Listing',
    path: '/products'
  },
  {
    name: 'Registry',
    path: '/registry'
  },
  {
    name: 'Seller Dashboard',
    path: '/seller/dashboard'
  }
];

const LIGHTHOUSE_FLAGS = {
  logLevel: 'info',
  output: 'html',
  onlyCategories: ['performance', 'accessibility', 'best-practices'],
  port: 0,
  throttling: {
    cpuSlowdownMultiplier: 4,
    downloadThroughputKbps: 1638.4,
    uploadThroughputKbps: 675.2,
    rttMs: 150
  }
};

async function runLighthouseTest(url, flags, config = null) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  flags.port = chrome.port;

  try {
    const results = await lighthouse(url, flags, config);
    return {
      report: results.report,
      lhr: results.lhr
    };
  } finally {
    await chrome.kill();
  }
}

async function saveReport(report, pageName) {
  const reportsDir = path.join(process.cwd(), 'lighthouse-reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${pageName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.html`;
  
  await fs.writeFile(path.join(reportsDir, fileName), report);
  return fileName;
}

async function analyzePerfMetrics(lhr) {
  const metrics = {
    'First Contentful Paint': lhr.audits['first-contentful-paint'].numericValue,
    'Time to Interactive': lhr.audits['interactive'].numericValue,
    'Speed Index': lhr.audits['speed-index'].numericValue,
    'Total Blocking Time': lhr.audits['total-blocking-time'].numericValue,
    'Largest Contentful Paint': lhr.audits['largest-contentful-paint'].numericValue,
    'Cumulative Layout Shift': lhr.audits['cumulative-layout-shift'].numericValue
  };

  return metrics;
}

async function main() {
  console.log('Starting performance tests...');
  const baseUrl = 'http://localhost:3000';
  const results = [];

  for (const page of PAGES_TO_TEST) {
    console.log(`Testing ${page.name}...`);
    const url = `${baseUrl}${page.path}`;
    
    try {
      const { report, lhr } = await runLighthouseTest(url, LIGHTHOUSE_FLAGS);
      const fileName = await saveReport(report, page.name);
      const metrics = await analyzePerfMetrics(lhr);
      
      results.push({
        page: page.name,
        reportFile: fileName,
        score: lhr.categories.performance.score * 100,
        metrics
      });
    } catch (error) {
      console.error(`Error testing ${page.name}:`, error);
    }
  }

  // Generate summary report
  const summary = results.map(result => ({
    page: result.page,
    score: result.score.toFixed(1),
    report: result.reportFile,
    metrics: Object.entries(result.metrics).map(([key, value]) => 
      `${key}: ${(value / 1000).toFixed(2)}s`
    ).join('\n    ')
  }));

  console.log('\nPerformance Test Results:');
  console.log('========================');
  
  summary.forEach(({ page, score, report, metrics }) => {
    console.log(`\n${page}`);
    console.log(`Score: ${score}%`);
    console.log(`Report: lighthouse-reports/${report}`);
    console.log('Metrics:');
    console.log(`    ${metrics}`);
  });
}

main().catch(console.error);
