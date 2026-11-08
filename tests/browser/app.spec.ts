import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const lesson=JSON.parse(readFileSync('src/content/python.json','utf8'))[0];
test('navigation, mobile overflow, and persistence',async({page})=>{
 await page.goto('./');await expect(page.getByRole('heading',{name:/Hey/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('./#/profile');await page.getByLabel('What should we call you?').fill('Test explorer');
 await page.reload();await expect(page.getByLabel('What should we call you?')).toHaveValue('Test explorer');
 for(const route of ['paths','practice','projects']){await page.goto('./#/'+route);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('real Python tests gate completion and saved XP survives refresh',async({page})=>{
 await page.goto('./#/lesson/'+lesson.id);
 await page.getByRole('button',{name:/Try it/}).click();
 if(['choice','predict','true-false'].includes(lesson.activity.type))await page.getByRole('button').filter({hasText:lesson.activity.answer}).first().click();
 else if(lesson.activity.type==='fill')await page.getByLabel('Your answer').fill(lesson.activity.answer);
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 await page.getByRole('button',{name:/Build it/}).click();
 await page.locator('.cm-content').fill(lesson.exercise.solution);
 await page.getByRole('button',{name:'Run & test'}).click();
 await expect(page.getByText(`${lesson.exercise.tests.length} / ${lesson.exercise.tests.length} passed`,{exact:true})).toBeVisible({timeout:150000});
 await page.getByRole('button',{name:/Reflect/}).click();await page.getByRole('button',{name:'Finish lesson'}).click();
 await expect(page.getByRole('heading',{name:'That’s a skill you can use.'})).toBeVisible();
 await page.reload();await page.goto('./#/profile');await expect(page.getByText(lesson.title,{exact:true})).toBeVisible();
});
