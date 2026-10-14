import { expect as baseExpect, test, type Page } from '@playwright/test';

// Сеть и параллельные тесты замедляют ответы базы: пяти секунд на шаг бывает мало
const expect = baseExpect.configure({ timeout: 15_000 });

const SCREENS = 'test-results/screens';

/** Удалить вошедший аккаунт через функцию базы — тест убирает за собой. */
async function deleteAccount(page: Page) {
  await page.evaluate(
    "import('/src/lib/supabase.ts').then(({ supabase }) => supabase.rpc('delete_my_account'))",
  );
}

test.describe('аккаунты на живой базе Supabase', () => {
  test.skip(Boolean(process.env.OFFLINE), 'Нужен интернет: OFFLINE=1 пропускает этот тест');
  test.use({ actionTimeout: 15_000 });

  test('учитель создаёт класс, студент учится, учитель видит прогресс и сбрасывает пароль', async ({ browser }) => {
    test.setTimeout(150_000);
    const tag = Math.random().toString(36).slice(2, 7);
    const className = `Тест ${tag}`;
    const nickname = `Маша ${tag}`;
    const teacherContext = await browser.newContext();
    const studentContext = await browser.newContext();
    const teacher = await teacherContext.newPage();
    const student = await studentContext.newPage();
    let teacherSignedUp = false;
    let studentSignedUp = false;

    try {
      // Учитель регистрируется
      await teacher.goto('/#/login');
      await teacher.getByRole('tab', { name: 'Я преподаватель' }).click();
      await teacher.getByRole('button', { name: 'Создать аккаунт' }).click();
      await teacher.getByLabel('Почта').fill(`teacher-${tag}@students.stylemancy.invalid`);
      await teacher.getByLabel('Имя — так вас увидят студенты').fill('Тест Учитель');
      await teacher.getByLabel('Пароль').fill('teacher-pass-1');
      await teacher.getByRole('button', { name: 'Создать аккаунт' }).click();
      await expect(teacher.getByRole('heading', { name: 'Панель учителя' })).toBeVisible();
      teacherSignedUp = true;

      await teacher.getByLabel('Новый класс').fill(className);
      await teacher.getByRole('button', { name: 'Создать класс' }).click();
      await expect(teacher.locator('.class-code')).toHaveText(/^[A-Z0-9]{6}$/);
      const code = (await teacher.locator('.class-code').textContent())!.trim();

      // Студент регистрируется по коду класса — без почты
      await student.goto('/#/login');
      await student.getByRole('button', { name: 'Создать аккаунт' }).click();
      await student.getByLabel('Код класса').fill(code.toLowerCase());
      await expect(student.getByText(`Класс «${className}»`)).toBeVisible();
      await student.getByLabel('Ник').fill(nickname);
      await student.getByLabel('Пароль').fill('student-pass-1');
      await student.getByRole('button', { name: 'Создать аккаунт' }).click();
      await expect(student.getByRole('heading', { name: 'Карта Каскадии' })).toBeVisible();
      studentSignedUp = true;
      await expect(student.getByText(`Класс «${className}»`)).toBeVisible();
      await expect(student.locator('.account__name')).toHaveText(nickname);
      // Пролог всей игры встречает на карте — с ником героя
      const prologue = student.getByRole('dialog', { name: 'Пролог: Великий Сброс' });
      await expect(prologue).toBeVisible();
      await prologue.getByRole('button', { name: 'Пропустить' }).click();

      // Студент проходит первый уровень
      await student.goto('/#/level/flex-01');
      // fill() у CodeMirror иногда вставляет текст, не выделив старый
      await student.locator('.cm-content').click();
      await student.keyboard.press('ControlOrMeta+A');
      await student.keyboard.insertText('.island {\n  display: flex;\n}\n');
      await student.getByRole('button', { name: /Сотворить/ }).click();
      await expect(student.getByText('Заклинание сработало!')).toBeVisible();

      // Студент сообщает учителю о проблеме прямо из уровня
      await student.getByRole('button', { name: 'Сообщить о проблеме' }).click();
      await student.getByRole('button', { name: 'Отправить учителю' }).click();
      await expect(student.getByText('Выбери, что случилось.')).toBeVisible();
      await student.getByLabel('Непонятно, что делать').check();
      await student.getByLabel(/Подробности/).fill('Тестовое сообщение: задание непонятное');
      await student.getByRole('button', { name: 'Отправить учителю' }).click();
      await expect(student.getByText('Сообщение ушло учителю.', { exact: false })).toBeVisible();
      await student.getByRole('button', { name: 'Вернуться к уровню' }).click();

      // Учитель видит его звёзды
      await expect
        .poll(
          async () => {
            await teacher.getByRole('button', { name: 'Обновить' }).click();
            return (await teacher.locator('.progress-table').textContent().catch(() => '')) ?? '';
          },
          { timeout: 30_000, intervals: [1000, 2000, 3000] },
        )
        .toContain('★★★');
      await expect(teacher.getByRole('row', { name: new RegExp(nickname) })).toContainText(/\b1\/\d+/);
      await teacher.screenshot({ path: `${SCREENS}/11-teacher.png`, fullPage: true });

      // Учитель открывает код решения
      await teacher.getByRole('button', { name: `${nickname}, Пробуждение` }).click();
      await expect(teacher.getByRole('dialog')).toContainText('display: flex');
      await teacher.keyboard.press('Escape');

      // Сообщение студента — в панели, вместе с кодом; учитель отмечает его решённым
      const messages = teacher.getByRole('region', { name: 'Сообщения студентов' });
      await expect(messages).toContainText('Сообщения студентов · новых: 1');
      await expect(messages).toContainText('Тестовое сообщение: задание непонятное');
      await expect(messages).toContainText('Непонятно, что делать');
      await messages.getByRole('button', { name: 'Код' }).click();
      await expect(teacher.getByRole('dialog')).toContainText('display: flex');
      await teacher.keyboard.press('Escape');
      await messages.getByRole('button', { name: 'Решено' }).click();
      await expect(messages).toContainText('Новых сообщений нет.');

      // Учитель сбрасывает пароль, студент входит с новым — прогресс на месте
      await teacher.getByRole('row', { name: new RegExp(nickname) }).getByRole('button', { name: 'Сбросить пароль' }).click();
      await teacher.getByRole('textbox', { name: /Новый пароль/ }).fill('fresh-pass-2');
      await teacher.getByRole('button', { name: 'Сбросить пароль' }).last().click();
      await expect(teacher.getByText('Готово. Новый пароль')).toBeVisible();

      // Выход: за этим компьютером снова гость, и его данные не смешиваются с аккаунтом
      await student.goto('/');
      await student.getByRole('button', { name: 'Выйти' }).click();
      await expect(student.getByText('Ты играешь как гость')).toBeVisible();
      await expect(student.getByRole('link', { name: /Парящие земли/ })).toContainText(/Пройдено 0 из \d+/);

      // Вход с другого компьютера (новый браузер без кеша) — прогресс пришёл с сервера
      const otherContext = await browser.newContext();
      const other = await otherContext.newPage();
      await other.goto('/#/login');
      await other.getByLabel('Код класса').fill(code);
      await other.getByLabel('Ник').fill(nickname);
      await other.getByLabel('Пароль').fill('fresh-pass-2');
      await other.getByRole('button', { name: 'Войти', exact: true }).click();
      await expect(other.locator('.account__name')).toHaveText(nickname);
      await other.goto('/#/land/floating-lands');
      await other.getByRole('button', { name: 'Пропустить' }).click();
      await expect(other.getByRole('img', { name: '3 из 3 звёзд' }).first()).toBeVisible();
      await other.screenshot({ path: `${SCREENS}/12-student-trail.png`, fullPage: true });
      await deleteAccount(other);
      studentSignedUp = false;
      await otherContext.close();
    } finally {
      if (studentSignedUp) await deleteAccount(student);
      if (teacherSignedUp) await deleteAccount(teacher);
      await teacherContext.close();
      await studentContext.close();
    }
  });

  test('вход: понятные ошибки', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('button', { name: 'Создать аккаунт' }).click();
    await page.getByLabel('Код класса').fill('ZZZZZZ');
    await expect(page.getByText('Класса с таким кодом нет')).toBeVisible();
    await page.screenshot({ path: `${SCREENS}/13-login.png`, fullPage: true });

    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await page.getByLabel('Ник').fill('Никто');
    await page.getByLabel('Пароль').fill('wrong-pass');
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Неверный код класса, ник или пароль');
  });
});
