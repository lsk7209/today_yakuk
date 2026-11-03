import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('**/*',route => ['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});

test('empty keyword search asks for input without requesting location', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'geolocation',{value:{ getCurrentPosition: () => { document.documentElement.dataset.unrequestedLocation='true'; } }});
  });
  await page.goto('/');
  await page.getByRole('button',{name:'검색하기',exact:true}).click();
  await expect(page.getByText('검색어는 2글자 이상 입력해주세요.',{exact:true})).toBeVisible();
  expect(await page.locator('html').getAttribute('data-unrequested-location')).toBeNull();
});

test('zero matches and failed search have different messages', async ({page}) => {
  let fail=false;
  await page.route('**/api/nearby?**',route => fail ? route.fulfill({status:503,json:{message:'unavailable'}}) : route.fulfill({json:{items:[],total:0}}));
  await page.goto('/');
  await page.getByPlaceholder('지역 또는 약국명 검색').fill('없는약국오타');
  await page.getByRole('button',{name:'검색하기',exact:true}).click();
  await expect(page.getByText(/검색 결과가 없습니다/)).toBeVisible();
  fail=true;
  await page.getByPlaceholder('지역 또는 약국명 검색').fill('서울');
  await page.getByRole('button',{name:'검색하기',exact:true}).click();
  await expect(page.getByText('검색 중 오류가 발생했습니다. 현재 위치로 다시 시도해 주세요.',{exact:true})).toBeVisible();
  await expect(page.getByText(/검색 결과가 없습니다/)).toHaveCount(0);
});

test('denied location leaves a regional navigation alternative',async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition: (_success:unknown, failure:(error:unknown)=>void) => failure({code:1,PERMISSION_DENIED:1})}});
  });
  await page.goto('/');
  await page.getByRole('button',{name:'현재 위치로 찾기',exact:true}).click();
  await expect(page.getByText('위치 권한이 거부되었습니다. 지역별 찾기를 이용해 주세요.',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'서울',exact:true}).first()).toBeVisible();
});
