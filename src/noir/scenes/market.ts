/*
  Лавка заказов в «Сумраке»: тёмная доска с тонкой холодной рамкой, предметы — прозрачные коробки с тёплой линией.
  Размеры и положение не трогаем: заказ принимается по ним.
*/

const MARKET = `
html {
  background: #05060a;
}

.board,
.header {
  background-color: rgba(185, 203, 232, 0.04);
  box-shadow:
    0 0 0 1px rgba(185, 203, 232, 0.4),
    0 24px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 40px rgba(185, 203, 232, 0.05);
}

.card,
.tile,
.photo,
.name,
.price,
.buy,
.logo,
.menu,
.cart {
  border: 1px solid var(--edge, #f0c890);
  background: var(--fill, rgba(240, 200, 144, 0.08));
  box-shadow: 0 0 14px -4px var(--edge, #f0c890);
}

.card::before,
.tile::before,
.photo::before,
.name::before,
.price::before,
.buy::before,
.logo::before,
.menu::before,
.cart::before {
  color: #e4dccd;
  font-family: "Golos Text", system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
}
`;

export const MARKET_SCENES: Record<string, string> = {
  market: MARKET,
};
