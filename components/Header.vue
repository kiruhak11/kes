<template>
  <header class="header">
    <div class="header__top">
      <div class="container">
        <div class="header__top-content">
          <div class="header__contacts">
            <a href="mailto:sb@kvzr.ru" class="header__email">sb@kvzr.ru</a>
            <a href="tel:88007001743" class="header__phone">8-800-700-17-43</a>
            <button class="header__callback">Заказать звонок</button>
          </div>
          <div class="header__user-actions">
            <a href="/questionnaires" class="header__link">Опросные листы</a>
            <a href="/faq" class="header__link">Вопрос-ответ</a>
            <a href="/compare" class="header__link">Сравнение <span>0 товаров</span></a>
            <a href="/cart" class="header__link">Корзина <span>0 товаров</span></a>
          </div>
        </div>
      </div>
    </div>
    <div class="header__main">
      <div class="container">
        <div class="header__main-content">
          <div class="header__logo">
            <NuxtLink to="/">
              <img src="/images/logo.png" alt="Котельный завод РЭП" />
            </NuxtLink>
          </div>
          <nav class="header__nav">
            <ul class="header__menu">
              <li><NuxtLink to="/catalog">Каталог продукции</NuxtLink></li>
              <li><NuxtLink to="/services">Услуги завода</NuxtLink></li>
              <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
              <li class="header__menu-item-has-children">
                <NuxtLink to="/about">О заводе</NuxtLink>
                <ul class="header__submenu">
                  <li><NuxtLink to="/about/documents">Документы завода</NuxtLink></li>
                  <li><NuxtLink to="/about/questionnaires">Опросные листы</NuxtLink></li>
                  <li><NuxtLink to="/about/calculator">Подобрать мощность котла</NuxtLink></li>
                  <li><NuxtLink to="/about/leasing">Купить котлы и котельные в лизинг</NuxtLink></li>
                  <li><NuxtLink to="/about/delivery">Доставка продукции</NuxtLink></li>
                  <li><NuxtLink to="/about/claims">Претензии и возврат</NuxtLink></li>
                  <li><NuxtLink to="/about/payment">Условия оплаты</NuxtLink></li>
                  <li><NuxtLink to="/about/vacancies">Вакансии</NuxtLink></li>
                  <li><NuxtLink to="/about/news">Новости</NuxtLink></li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>


.header__top {
  background: #f5f5f5;
  padding: 10px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header__top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__contacts {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__email,
.header__phone {
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.header__callback {
  background: #e31e24;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.header__user-actions {
  display: flex;
  gap: 20px;
}

.header__link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.header__main {
  padding: 20px 0;
  margin-top: 70px;
}

.header__main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__logo img {
  height: 60px;
}

.header__menu {
  display: flex;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.header__menu a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.header__menu-item-has-children {
  position: relative;
}

.header__submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  min-width: 250px;
  display: none;
}

.header__menu-item-has-children:hover .header__submenu {
  display: block;
}

.header__submenu li {
  list-style: none;
}

.header__submenu a {
  display: block;
  padding: 8px 20px;
  font-size: 14px;
}

.header__submenu a:hover {
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}
</style>
