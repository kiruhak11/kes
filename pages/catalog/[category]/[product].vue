<template>
  <div class="product-detail-page">
    <div class="container">
      <NuxtLink :to="`/catalog/${categorySlug}`" class="back-link">
        &larr; Назад к категории
      </NuxtLink>
      <div v-if="product" class="product-detail-card">
        <!-- Верхний блок: галерея + инфо -->
        <div class="product-top-row">
          <div class="product-gallery">
            <!-- Основное изображение -->
            <div class="main-image-container">
              <button v-if="imageList.length > 1" class="gallery-nav prev" @click="prevImage">
                <i class="fas fa-chevron-left"></i>
              </button>
              <img 
                :src="imageList[currentImageIndex] || '/images/placeholders/placeholder.png'" 
                :alt="product.name" 
                class="main-image" 
              />
              <button v-if="imageList.length > 1" class="gallery-nav next" @click="nextImage">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <!-- Миниатюры -->
            <div v-if="imageList.length > 1" class="thumbnails-container">
              <div class="thumbnails-scroll">
                <button 
                  v-for="(img, idx) in imageList" 
                  :key="idx"
                  :class="['thumbnail-btn', { active: idx === currentImageIndex }]"
                  @click="currentImageIndex = idx"
                >
                  <img :src="img" :alt="`${product.name} - изображение ${idx + 1}`" />
                </button>
              </div>
            </div>
          </div>

          <div class="product-info-block">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-main-row">
              <div class="product-main-description">
                <p class="product-short-description">{{ product.description }}</p>
              </div>
              <div class="product-main-specs">
                <div v-for="([key, value], idx) in Object.entries(product.specs || {}).filter(([k]) => k !== 'images' && k !== 'power' && k !== 'fuel').slice(0, 4)" :key="key" class="spec-item">
                  <span class="spec-label">{{ capitalize(key) }}</span>
                  <span class="spec-dots"></span>
                  <span class="spec-value">{{ Array.isArray(value) ? value.join(', ') : value }}</span>
                </div>
              </div>
            </div>
            <div class="product-main-actions">
              <div class="cart-action-wrap">
                <div class="product-card__price-block">
                  <span class="product-price">{{ product.price.toLocaleString() }} <span class="currency">₽</span></span>
                  <span class="product-price-note">Цена с НДС</span>
                </div>
                <button v-if="!cartCount" class="buy-btn" @click="addToCart">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-13z" stroke="#e31e24" stroke-width="2"/><circle cx="9" cy="20" r="1" fill="#e31e24"/><circle cx="18" cy="20" r="1" fill="#e31e24"/></svg>
                  <span>Положить в корзину</span>
                </button>
                <div v-else class="cart-counter">
                  <button class="cart-minus" @click="decrementCart">-</button>
                  <span class="cart-qty">{{ cartCount }}</span>
                  <button class="cart-plus" @click="incrementCart">+</button>
                </div>
              </div>
              <div class="product-main-actions-right">
                <button class="offer-btn" @click="openCommercialOfferModal(product)">
                  Заказать коммерческое предложение
                </button>
                <a :href="`tel:${contacts.phone[0]}`" class="offer-btn">Уточнить наличие</a>
              </div>
            </div>
          </div>
        </div>
        <hr class="section-divider" />
        <!-- Вкладки -->
        <div class="product-tabs">
          <button
            v-for="tab in productTabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'description'" class="section-block">
            <h2 class="section-title">Описание товара</h2>
            <p>{{ product.extendedDescription }}</p>
          </div>
          <div v-if="activeTab === 'specs'" class="section-block">
            <h2 class="section-title">Технические характеристики</h2>
            <ul class="specs-list">
              <li v-for="([key, value], idx) in displaySpecs" :key="key" class="spec-item">
                <span class="spec-label">{{ capitalize(key) }}</span>
                <span class="spec-dots"></span>
                <span class="spec-value">{{ Array.isArray(value) ? value.join(', ') : value }}</span>
              </li>
            </ul>
          </div>
          <div v-if="activeTab === 'delivery'" class="section-block">
            <h2 class="section-title">Комплект поставки</h2>
            <ul class="delivery-list">
              <li>Котел в сборе</li>
              <li>Паспорт и инструкция</li>
              <li>Упаковка</li>
              <li>Сопроводительные документы</li>
            </ul>
          </div>
          <div v-if="activeTab === 'scheme'" class="section-block">
            <h2 class="section-title">Схема подключения</h2>
            <div class="scheme-placeholder">
              <span class="scheme-icon">🔧</span>
              <span>Схема подключения появится здесь</span>
            </div>
          </div>
          <div v-if="activeTab === 'certificates'" class="section-block certificates-block">
            <h2 class="section-title">Сертификаты и гарантии</h2>
            <div class="cert-gallery-slider-wrap">
              <div class="cert-gallery-scroll">
                <div class="cert-gallery-track">
                  <div v-for="certificate in certificates" :key="certificate.id" class="cert-gallery-card">
                    <div class="cert-gallery-img-wrap">
                      <img :src="certificate.image" :alt="certificate.title" />
                    </div>
                    <div class="cert-gallery-title">{{ certificate.title }}</div>
                    <button class="cert-gallery-btn" @click="openCertificateModal(certificate)">Просмотреть</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="cert-gallery-controls">
              <div class="cert-gallery-arrow cert-gallery-arrow-left" :class="{ disabled: galleryActiveIndex === 0 }" @click="scrollGalleryBy(-1)">
                <svg width="32" height="32" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#e31e24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="cert-gallery-dots">
                <span v-for="(c, idx) in certificates" :key="idx" :class="['cert-gallery-dot', { active: idx === galleryActiveIndex }]" @click="scrollToGalleryCard(idx)"></span>
              </div>
              <div class="cert-gallery-arrow cert-gallery-arrow-right" :class="{ disabled: galleryActiveIndex === certificates.length - 1 }" @click="scrollGalleryBy(1)">
                <svg width="32" height="32" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#e31e24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div v-if="activeTab === 'reviews'" class="section-block reviews-block">
            <h2 class="section-title">Отзывы о продукции</h2>
            <div class="review-card">
              <div class="review-author">Иван Петров</div>
              <div class="review-text">Отличный котел, быстро доставили и помогли с установкой!</div>
            </div>
            <div class="review-card">
              <div class="review-author">ООО "ТеплоСервис"</div>
              <div class="review-text">Работаем с этим заводом не первый год, всегда всё на высшем уровне.</div>
            </div>
          </div>
        </div>
        <hr class="section-divider" />
        <!-- О заводе -->
        <div class="about-factory-section">
          <div class="factory-menu">
            <button v-for="tab in factoryTabs" :key="tab.key" :class="['factory-tab-btn', { active: activeFactoryTab === tab.key }]" @click="activeFactoryTab = tab.key">
              {{ tab.label }}
            </button>
          </div>
          <div class="factory-content">
            <div v-if="activeFactoryTab === 'certificates'">
              <section class="certificates-gallery-section">
                <h2 class="certificates-gallery-title">Сертификаты и гарантии</h2>
                <p class="certificates-gallery-desc">Вся продукция сертифицирована и сопровождается гарантией завода-изготовителя.</p>
                <div class="cert-gallery-slider-wrap">
                  <div class="cert-gallery-scroll">
                    <div class="cert-gallery-track">
                      <div v-for="certificate in certificates" :key="certificate.id" class="cert-gallery-card">
                        <div class="cert-gallery-img-wrap">
                          <img :src="certificate.image" :alt="certificate.title" />
                        </div>
                        <div class="cert-gallery-title">{{ certificate.title }}</div>
                        <button class="cert-gallery-btn" @click="openCertificateModal(certificate)">Просмотреть</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="cert-gallery-controls">
                  <div class="cert-gallery-arrow cert-gallery-arrow-left" :class="{ disabled: galleryActiveIndex === 0 }" @click="scrollGalleryBy(-1)">
                    <svg width="32" height="32" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#e31e24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="cert-gallery-dots">
                    <span v-for="(c, idx) in certificates" :key="idx" :class="['cert-gallery-dot', { active: idx === galleryActiveIndex }]" @click="scrollToGalleryCard(idx)"></span>
                  </div>
                  <div class="cert-gallery-arrow cert-gallery-arrow-right" :class="{ disabled: galleryActiveIndex === certificates.length - 1 }" @click="scrollGalleryBy(1)">
                    <svg width="32" height="32" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#e31e24" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                </div>
              </section>
            </div>
            <div v-else-if="activeFactoryTab === 'about'">
              <div class="factory-about-block">
                <h3>О заводе</h3>
                <p>Наш завод — один из лидеров отрасли, производящий современные котлы и оборудование для промышленности и ЖКХ. Мы гордимся своей историей, инновациями и командой профессионалов.</p>
              </div>
            </div>
            <div v-else-if="activeFactoryTab === 'production'">
              <div class="factory-production-block">
                <h3>Производство</h3>
                <p>Современные производственные линии, строгий контроль качества, автоматизация и экологичность — всё это позволяет нам выпускать продукцию мирового уровня.</p>
              </div>
            </div>
            <div v-else-if="activeFactoryTab === 'team'">
              <div class="factory-team-block">
                <h3>Наша команда</h3>
                <p>В нашем коллективе работают инженеры, технологи, менеджеры и рабочие с многолетним опытом. Мы ценим каждого сотрудника и вместе достигаем новых высот!</p>
              </div>
            </div>
          </div>
        </div>
        <hr class="section-divider" />
        <!-- Похожие товары -->
        <div class="related-products-section">
          <h2 class="section-title">Вам также может понравиться</h2>
          <div class="related-products-grid">
            <div 
              v-for="relatedProduct in relatedProducts" 
              :key="relatedProduct.id" 
              class="product-card"
              @click="router.push(`/catalog/${relatedProduct.category_slug || categorySlug}/${generateProductSlug(relatedProduct)}`)"
            >
              <img :src="relatedProduct.image" :alt="relatedProduct.name" />
              <div class="product-card__content">
                <h3>{{ relatedProduct.name }}</h3>
                <div class="related-category">{{ relatedProduct.description.slice(0, 32) + '...' }}</div>
                <div class="related-price">{{ relatedProduct.price.toLocaleString() }} &#8381;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-product-message">
        Товар не найден.
      </div>
      <CommercialOfferModal
        v-if="showCommercialOfferModal && selectedProduct"
        :is-open="showCommercialOfferModal"
        :product="selectedProduct"
        @close="closeCommercialOfferModal"
      />
      <div v-if="selectedCertificate" class="cert-modal" @click="closeCertificateModal">
        <div class="cert-modal-content" @click.stop>
          <button class="cert-modal-close" @click="closeCertificateModal">&times;</button>
          <div class="cert-modal-title">{{ selectedCertificate.title }}</div>
          <img :src="selectedCertificate.image" :alt="selectedCertificate.title" class="cert-modal-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue';
import { useCartStore } from '~/stores/cart';
import { contacts } from '~/data/contacts';
import { useModalStore } from '~/stores/modal';
import CommercialOfferModal from '~/components/CommercialOfferModal.vue';

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
    'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

interface ProductSpecs {
  [key: string]: any
}

interface APIProduct {
  id: number
  name: string | null
  price: number | null
  image: string | null
  description: string | null
  extendedDescription: string | null
  category_id: string | null
  additional_images: string[] | null
  specs: ProductSpecs
}

interface Product {
  id: number
  name: string
  description: string
  extendedDescription: string
  price: number
  image: string
  category: string
  category_slug: string
  slug: string
  specs?: ProductSpecs
  additional_images?: string[]
}

interface Certificate {
  id: number;
  title: string;
  image: string;
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Get category and product slugs from route
const categorySlug = computed(() => {
  const slug = route.params.category
  return typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
})

const productSlug = computed(() => {
  const slug = route.params.product
  return typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
})

// Fetch products
const { data: fetchedProducts, error: fetchError } = await useFetch(`/api/products`, {
  query: computed(() => ({
    categorySlug: categorySlug.value
  })),
  transform: (response) => { 
    if (!response || typeof response !== 'object' || !('products' in response)) {
      console.error('Invalid response format:', response)
      return []
    }
    return response.products
  }
})

// Initialize products as an empty array
const products = ref<Product[]>([])

// Handle fetch errors
if (fetchError.value) {
  console.error('Error fetching products:', fetchError.value)
  products.value = []
} else if (fetchedProducts.value) {
  // Only map if we have valid data
  products.value = (fetchedProducts.value as APIProduct[]).map(product => ({
    id: product.id,
    name: product.name || '',
    description: product.description || '',
    extendedDescription: product.extendedDescription || '',
    price: product.price || 0,
    image: product.image || '',
    category: '', // Will be filled from category data
    category_slug: '', // Will be filled from category data
    slug: '', // Will be generated
    additional_images: product.additional_images || [],
    specs: product.specs || {}
  }))
} else {
  products.value = []
}

// Get the current product
const currentProduct = computed(() => {
  if (!products.value || products.value.length === 0) { 
    return null
  }
   
  
  // Find product by matching slug or generated slug from name
  const foundProduct = products.value.find(p => {
    const generatedSlug = transliterate((p.name || '').toLowerCase())
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    return p.slug === productSlug.value || generatedSlug === productSlug.value
  })
  
  if (!foundProduct) {
    console.error('Product not found:', {
      productSlug: productSlug.value,
      availableProducts: products.value.map(p => ({
        name: p.name,
        slug: p.slug
      }))
    })
  } else { 
  }

  return foundProduct || null
})

// Handle product not found
watch(currentProduct, (product) => {
  if (!product && products.value.length > 0) { 
    router.push(`/catalog/${categorySlug.value}`)
  }
}, { immediate: true })

// Use currentProduct in the template
const product = currentProduct

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const cartStore = useCartStore();
const modalStore = useModalStore()
// Текущий индекс изображения
const currentImageIndex = ref(0)

// Сброс индекса при изменении продукта
watch(product, () => {
  currentImageIndex.value = 0
})

// Навигация по галерее
const nextImage = () => {
  if (currentImageIndex.value < imageList.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = imageList.value.length - 1
  }
}

const addToCart = () => {
  if (!product.value) return;

  const cartItem = {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    quantity: 1,
    category: product.value.category || 'Без категории',
    category_slug: product.value.category_slug || categorySlug.value || 'unknown',
    slug: product.value.slug || generateProductSlug(product.value)
  };

  cartStore.addItem(JSON.parse(JSON.stringify(cartItem)));
  modalStore.showSuccess('Товар добавлен в корзину');
}

// Отображаемые характеристики
const displaySpecs = computed(() => {
  if (!product.value?.specs) return []
  
  return Object.entries(product.value.specs)
    .filter(([key, value]) => 
      value !== null && 
      value !== undefined && 
      value !== '' && 
      key !== 'images' && 
      key !== 'power' && 
      key !== 'fuel'
    )
    .map(([key, value]) => {
      // Обработка массивов (например, для топлива)
      if (Array.isArray(value)) {
        return [key, value.join(', ')]
      }
      return [key, value]
    })
})

// Похожие товары
const relatedProducts = computed(() => {
  if (!product.value || !products.value) return []
  
  // Фильтруем товары, исключая текущий
  const filteredProducts = products.value.filter(p => p.id !== product.value?.id)
  
  // Перемешиваем массив и берем первые 3 элемента
  const shuffled = [...filteredProducts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
})

const generateProductSlug = (product: Product): string => {
  if (!product || !product.name) return ''
  return transliterate(product.name)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const productTabs = [
  { key: 'description', label: 'Описание товара' },
  { key: 'specs', label: 'Технические характеристики' },
  { key: 'delivery', label: 'Комплект поставки' },
  { key: 'scheme', label: 'Схема подключения' },
  { key: 'certificates', label: 'Сертификаты и гарантии' },
  { key: 'reviews', label: 'Отзывы' },
];
const activeTab = ref('description');

const showCommercialOfferModal = ref(false);
const selectedProduct = ref<any>(null);
const openCommercialOfferModal = (product: any) => {
  selectedProduct.value = product;
  showCommercialOfferModal.value = true;
};
const closeCommercialOfferModal = () => {
  showCommercialOfferModal.value = false;
  selectedProduct.value = null;
};

const factoryTabs = [
  { key: 'certificates', label: 'Сертификаты' },
  { key: 'about', label: 'О заводе' },
  { key: 'production', label: 'Производство' },
  { key: 'team', label: 'Команда' },
];
const activeFactoryTab = ref('certificates');

const certificates = [
  { id: 1, title: 'Котлы угольные', image: '/certificates/sert_kotl_ugoln.png' },
  { id: 2, title: 'Котлы газовые', image: '/certificates/sert_kotl_gaz.png' },
  { id: 3, title: 'Котлы на мазуте', image: '/certificates/sert_kotl_maz.png' },
  { id: 4, title: 'Котлы дизельные', image: '/certificates/sert_kotl_diz.png' },
  { id: 5, title: 'Сертификат соответствия КМТ', image: '/certificates/sert_sootv_MKT.png' },
  { id: 6, title: 'Котлы газовые и мазутные', image: '/certificates/sert_kotl_gaz_maz.png' },
];
const selectedCertificate = ref<Certificate | null>(null);
const openCertificateModal = (certificate: Certificate) => { selectedCertificate.value = certificate; };
const closeCertificateModal = () => { selectedCertificate.value = null; };

const galleryActiveIndex = ref(0);
function scrollToGalleryCard(idx: number) {
  const scrollContainer = document.querySelector('.cert-gallery-scroll');
  const track = document.querySelector('.cert-gallery-track');
  if (scrollContainer && track) {
    const maxScroll = track.scrollWidth - scrollContainer.clientWidth;
    const dotsCount = certificates.length;
    let scrollLeft = 0;
    if (dotsCount > 1) {
      scrollLeft = (maxScroll * idx) / (dotsCount - 1);
    }
    scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    galleryActiveIndex.value = idx;
  }
}

const imageList = computed<string[]>(() => {
  if (!product.value) return []
  // Основное изображение
  const mainImage = product.value.image
  // Дополнительные изображения
  const additionalImages = product.value.additional_images || []
  // Объединяем основное изображение и дополнительные
  return [mainImage, ...additionalImages].filter(Boolean)
})

const cartItem = computed(() => cartStore.items.find((item: any) => item.id === product.value?.id));
const cartCount = computed(() => cartItem.value ? cartItem.value.quantity : 0);
const incrementCart = () => {
  if (product.value) {
    const cartItem = {
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      quantity: 1,
      category: product.value.category || 'Без категории',
      category_slug: product.value.category_slug || categorySlug.value || 'unknown',
      slug: product.value.slug || generateProductSlug(product.value)
    };
    cartStore.addItem(JSON.parse(JSON.stringify(cartItem)));
  }
};
const decrementCart = () => {
  if (product.value && cartItem.value && cartItem.value.quantity > 0) {
    cartStore.removeItem(product.value.id);
  }
};

if (typeof window !== 'undefined') {
  setTimeout(() => {
    const track = document.querySelector('.cert-gallery-track');
    if (track) {
      track.addEventListener('scroll', () => {
        const cards = Array.from(track.children) as HTMLElement[];
        let minDiff = Infinity;
        let activeIdx = 0;
        cards.forEach((card, idx) => {
          const diff = Math.abs((track.scrollLeft || 0) - card.offsetLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIdx = idx;
          }
        });
        galleryActiveIndex.value = activeIdx;
      });
    }
  }, 500);
}

function scrollGalleryBy(delta: number) {
  let newIdx = galleryActiveIndex.value + delta;
  newIdx = Math.max(0, Math.min(certificates.length - 1, newIdx));
  scrollToGalleryCard(newIdx);
}
</script>

<style scoped lang="scss">
.product-main-actions-right {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
.product-detail-page {
  padding: 40px 0;
  background: #fafbfc;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}
.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}
.back-link:hover {
  text-decoration: underline;
}
.product-detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  padding: 32px 24px 24px 24px;
  margin-bottom: 32px;
}
.product-top-row {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 32px;
}
.product-gallery {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 1rem;

  @media (max-width: 768px) {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .main-image-container {
    position: relative;
    width: 100%;
    padding-bottom: 75%; 
    margin-bottom: 1rem;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-light);

    img.main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: opacity 0.3s ease;
    }

    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      color: var(--text);
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 2;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      &.prev {
        left: 1rem;
      }

      &.next {
        right: 1rem;
      }

      i {
        font-size: 0.8rem;
      }
    }
  }

  .thumbnails-container {
    margin-top: 1rem;
    width: 100%;
    overflow: hidden;

    .thumbnails-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding: 0.5rem 0;
      scrollbar-width: thin;
      scrollbar-color: var(--primary) transparent;

      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--primary);
        border-radius: 3px;
      }
    }

    .thumbnail-btn {
      flex: 0 0 80px;
      height: 80px;
      padding: 0;
      border: 2px solid transparent;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      background: none;
      transition: all 0.2s ease;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.2s ease;
      }

      &:hover img {
        opacity: 0.8;
      }

      &.active {
        border-color: var(--primary);

        img {
          opacity: 1;
        }
      }
    }
  }
}
.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: flex-start;
}
.product-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0;
  color: #222;
}
.product-short-description {
  color: #555;
  margin-bottom: 0;
  line-height: 1.5;
}
.product-main-row {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: flex-start;
  margin-top: 12px;
}
.product-main-description {
  flex: 2;
  font-size: 1.08rem;
  color: #444;
  line-height: 1.6;
}
.product-main-specs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.product-main-actions {
  display: flex;
  align-items: stretch;
  gap: 18px;
  margin-top: 24px;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
}
.product-card__price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #f7f7f7;
  border-radius: 12px;
  padding: 12px 24px;
  flex: 1 1 50%;
  min-width: 0;
  box-shadow: 0 2px 12px rgba(227,30,36,0.04);
  margin: 0;
  justify-content: center;
}
.product-price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e31e24;
  line-height: 1;
}
.currency {
  font-size: 1.2rem;
}
.product-price-note {
  font-size: 0.9rem;
  color: #888;
  margin-top: 2px;
}
.buy-btn {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px solid #e31e24;
  background: #fff;
  color: #e31e24;
  font-size: 1.18rem;
  font-weight: 600;
  height: 54px;
  box-shadow: 0 2px 16px rgba(227,30,36,0.07);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.25s, border-color 0.2s, background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}
.buy-btn svg {
  margin-right: 8px;
  width: 28px;
  height: 28px;
}
.buy-btn:hover {
  background: #fff6f6;
  color: #e31e24;
  border-color: #e31e24;
  box-shadow: 0 4px 24px rgba(227,30,36,0.13);
}
.buy-btn::after {
  content: '';
  display: block;
  position: absolute;
  left: -60%;
  top: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0.12) 100%);
  transform: skewX(-25deg);
  transition: left 0.4s cubic-bezier(.4,0,.2,1);
  pointer-events: none;
}
.buy-btn:hover::after {
  left: 110%;
}
.cart-action-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  min-width: 0;
  gap: 12px;
  flex: 1 1 50%;
  margin-bottom: 0;
  box-sizing: border-box;
}
.offer-btn {
  background: linear-gradient(45deg, #e31e24, #ff4d4d);
  color: #fff;
  border: none;
  padding: 6px 22px;
  font-size: 1rem;
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.10);
  transition: all 0.3s;
}
.offer-btn:hover {
  background: linear-gradient(45deg, #ff4d4d, #e31e24);
}
.marketing-section {
  margin: 0 auto 32px auto;
  max-width: 600px;
}
.marketing-card {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.13);
}
.marketing-card h3 {
  font-size: 1.6rem;
  margin-bottom: 10px;
}
.marketing-phone {
  display: inline-block;
  background: white;
  color: #ff6b6b;
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 15px;
  transition: transform 0.2s;
}
.marketing-phone:hover {
  transform: scale(1.05);
}
.related-products-section {
  margin: 48px auto 0 auto;
}
.section-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
  color: #222;
}
.related-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 80px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  overflow: visible;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-7px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.product-card img {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;
  object-fit: contain;
  z-index: 2;
  border-radius: 8px;
  background: transparent;
}
.product-card__content {
  padding: 32px 16px 16px 16px;
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.product-card h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 700;
  color: #222;
}
.related-category {
  color: #888;
  font-size: 0.98rem;
  margin-bottom: 10px;
}
.related-price {
  color: #007bff;
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 0;
}
.no-product-message {
  text-align: center;
  font-size: 1.5rem;
  color: #999;
  padding: 50px 0;
}
@media (max-width: 1024px) {
  .product-top-row, .product-middle-row {
    flex-direction: column;
    gap: 24px;
  }
  .product-gallery {
    width: 100%;
    min-width: 0;
  }
  .related-products-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 768px) {
  .product-detail-card {
    padding: 12px 4px;
  }
  .main-image {
    height: 180px;
  }
  .marketing-card {
    padding: 18px 6px;
  }
  .related-products-grid {
    grid-template-columns: 1fr;
  }
  .product-gallery {
    flex: 0 0 100%;
    max-width: 100%;
  }
  .product-main-row {
    flex-direction: column;
    gap: 12px;
  }
  .product-main-specs {
    max-width: 100%;
    min-width: 0;
  }
  .buy-btn, .cart-counter {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .product-main-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
  }
  .cart-action-wrap, .product-card__price-block {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }
}
@media (max-width: 480px) {
  .product-title {
    font-size: 1.1rem;
  }
  .main-image {
    height: 110px;
  }
  .related-products-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .product-card {
    min-height: 220px;
    padding-top: 40px;
  }
  .product-card img {
    width: 70px;
    height: 70px;
    top: -20px;
  }
  .product-card__content {
    padding: 16px 6px 8px 6px;
  }
}
.btn-red {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 14px 32px;
  transition: background 0.3s, transform 0.2s;
}
.btn-red:hover {
  background: #ff6b6b;
  color: #fff;
  transform: scale(1.04);
}
.section-divider {
  border: none;
  border-top: 2px solid #eee;
  margin: 36px 0 24px 0;
}
.section-block {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px 24px;
  margin-bottom: 24px;
}
.section-title {
  font-size: 1.4rem;
  margin-bottom: 18px;
  color: #ff6b6b;
  font-weight: 700;
}
.specs-list {
  list-style: none;
  padding: 0;
  width: 100%;
  margin: 0;
}
.delivery-list {
  list-style: disc inside;
  color: #333;
  font-size: 1.05rem;
  margin-left: 1.2em;
}
.scheme-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f7fa;
  border-radius: 8px;
  min-height: 120px;
  color: #aaa;
  font-size: 1.1rem;
  margin: 0 auto;
  max-width: 420px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  gap: 8px;
}
.scheme-icon {
  font-size: 2.2rem;
  margin-bottom: 6px;
}
.certificates-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7f7fa;
  border-radius: 8px;
  min-height: 90px;
  color: #aaa;
  font-size: 1.1rem;
  margin-bottom: 18px;
  gap: 8px;
}
.cert-icon {
  font-size: 2rem;
  margin-bottom: 4px;
}
.certificates-block {
  text-align: center;
}
.certificates-row {
  display: flex;
  gap: 18px;
  justify-content: center;
  margin-bottom: 18px;
}
.certificates-row img {
  width: 90px;
  height: 90px;
  object-fit: contain;
  border-radius: 8px;
  background: #f7f7fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.reviews-block {
  background: #f7f7fa;
}
.review-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 18px 16px;
  margin-bottom: 12px;
}
.review-author {
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 6px;
}
.review-text {
  color: #333;
}
.contacts-block {
  background: #fff0f0;
}
.contacts-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.contacts-info {
  font-size: 1.1rem;
  color: #333;
}
.contacts-phone, .contacts-email {
  color: #ff6b6b;
  text-decoration: underline;
}
.order-call-btn {
  margin-left: 24px;
}
.product-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
  background: #fafbfc;
  padding: 0 0 0.5rem 0;
}
.tab-btn {
  background: none;
  border: none;
  outline: none;
  font-size: 1.08rem;
  font-weight: 500;
  color: #888;
  padding: 10px 22px 10px 22px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  position: relative;
}
.tab-btn.active {
  background: #fff;
  color: #ff6b6b;
  border-bottom: 2px solid #ff6b6b;
  font-weight: 700;
  z-index: 2;
}
.tab-btn:not(.active):hover {
  background: #f7f7fa;
  color: #222;
}
.tab-content {
  margin-top: 0;
}
.spec-item {
  display: flex;
  align-items: center;
  font-size: 1rem;
  margin-bottom: 4px;
}
.spec-label {
  color: #222;
  min-width: 120px;
  font-weight: 600;
}
.spec-dots {
  flex: 1;
  border-bottom: 1px dotted #bbb;
  margin: 0 8px;
  height: 1px;
}
.spec-value {
  font-weight: 500;
  color: #333;
}
.cart-counter {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px solid #e31e24;
  background: #fff;
  height: 54px;
  display: flex;
  align-items: center;
  gap: 0;
  box-shadow: 0 2px 16px rgba(227,30,36,0.07);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.25s, border-color 0.2s, background 0.2s, color 0.2s;
}
.cart-minus, .cart-plus {
  background: transparent;
  border: none;
  color: #e31e24;
  font-size: 2rem;
  font-weight: 700;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  border-radius: 0;
}
.cart-minus:hover, .cart-plus:hover {
  background: #fff6f6;
  color: #b71c1c;
}
.cart-qty {
  flex: 1 1 auto;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #e31e24;
  letter-spacing: 0.04em;
}
.about-factory-section {
  display: flex;
  gap: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin: 48px 0;
  padding: 32px 24px;
  min-height: unset !important;
  height: auto !important;
}
.factory-menu {
  flex: 0 0 18%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-right: 2px solid #f0f0f0;
  padding-right: 18px;
}
.factory-tab-btn {
  background: none;
  border: none;
  font-size: 1.08rem;
  font-weight: 600;
  color: #888;
  padding: 14px 10px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
}
.factory-tab-btn.active {
  background: #f7f7fa;
  color: #e31e24;
}
.factory-content {
  flex: 1 1 82%;
  padding-left: 32px;
  min-width: 0;
  overflow: visible;
}
.certificates-gallery-section {
  position: relative;
  z-index: 1;
  overflow: visible;
  padding-bottom: 0;
  padding-top: 0;
  margin-bottom: 0;
}
.certificates-gallery-title {
  margin-top: 0;
  margin-bottom: 8px;
}
.certificates-gallery-desc {
  margin-bottom: 16px;
}
.cert-gallery-slider-wrap {
  width: 100%;
  max-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  padding-bottom: 0;
  margin-top: 0 !important;
  margin-bottom: 0;
}
.cert-gallery-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 18px;
  user-select: none;
  height: 48px;
}
.cert-gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  position: static;
  background: #fff;
  border: 2px solid #e31e24;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(227,30,36,0.07);
  font-size: 1.2rem;
  transition: background 0.2s, border 0.2s, opacity 0.2s;
  opacity: 0.92;
  pointer-events: auto;
  margin: 0;
}
.cert-gallery-arrow.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
.cert-gallery-arrow:hover:not(.disabled) {
  background: #fff6f6;
  border-color: #ff6b6b;
}
@media (max-width: 900px) {
  .cert-gallery-arrow {
    width: 32px;
    height: 32px;
  }
  .cert-gallery-controls {
    gap: 12px;
  }
}
@media (max-width: 600px) {
  .cert-gallery-arrow {
    width: 24px;
    height: 24px;
  }
  .cert-gallery-controls {
    gap: 6px;
  }
}
.cert-gallery-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0;
  margin-bottom: 0;
  scrollbar-width: none;
  overflow-y: visible;
}
.cert-gallery-scroll::-webkit-scrollbar {
  display: none;
}
.cert-gallery-track {
  display: flex;
  gap: 28px;
  margin-top: 64px;
  width: max-content;
  min-width: 100%;
  padding-bottom: 0;
  overflow: visible;
}
.cert-gallery-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 6px 32px rgba(227,30,36,0.10);
  min-width: 240px;
  max-width: 260px;
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 32px 12px 16px 12px;
  position: relative;
  transition: box-shadow 0.25s, transform 0.25s, opacity 0.25s;
  opacity: 0.98;
  border: 1.5px solid #f3eaea;
  z-index: 10;
}
.cert-gallery-card:hover {
  box-shadow: 0 16px 48px 0 rgba(227,30,36,0.18), 0 2px 12px 0 rgba(0,0,0,0.10);
  transform: translateY(-10px) scale(1.04);
  opacity: 1;
  border-color: #ffeaea;
  z-index: 10;
}
.cert-gallery-img-wrap {
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 72px;
  background: #fff6f6;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(227,30,36,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  border: 2px solid #e31e24;
  z-index: 20;
}
.cert-gallery-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cert-gallery-title {
  font-size: 1.02rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 10px;
  margin-top: 44px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  max-height: 2.6em;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.cert-gallery-btn {
  background: linear-gradient(45deg, #e31e24, #ff4d4d);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 7px 18px;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.10);
  transition: all 0.3s;
  margin-top: auto;
}
.cert-gallery-btn:hover {
  background: linear-gradient(45deg, #ff4d4d, #e31e24);
}
.cert-gallery-dots {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
}
.cert-gallery-dot {
  width: 18px;
  height: 10px;
  border-radius: 8px;
  background: #fff;
  border: 2px solid #e31e24;
  box-shadow: 0 2px 8px rgba(227,30,36,0.10);
  transition: background 0.35s, transform 0.35s, border 0.35s, width 0.35s, box-shadow 0.35s;
  cursor: pointer;
  opacity: 0.7;
  position: relative;
  margin: 0;
  vertical-align: middle;
}
.cert-gallery-dot:hover {
  opacity: 1;
  border-color: #ff6b6b;
  box-shadow: 0 0 12px #e31e24;
}
.cert-gallery-dot.active {
  width: 36px;
  background: linear-gradient(90deg, #e31e24 60%, #ff6b6b 100%);
  border-color: #ff6b6b;
  box-shadow: 0 0 16px #e31e24, 0 2px 8px rgba(227,30,36,0.13);
  opacity: 1;
  transform: scale(1.18);
}
.cert-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.cert-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px 24px 24px;
  max-width: 96vw;
  max-height: 90vh;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cert-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #e31e24;
  cursor: pointer;
  z-index: 2;
}
.cert-modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #e31e24;
  text-align: center;
}
.cert-modal-img {
  max-width: 80vw;
  max-height: 60vh;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(227,30,36,0.13);
  background: #fff6f6;
  border: 2px solid #e31e24;
}
@media (max-width: 600px) {
  .cert-modal-content {
    padding: 12px 4px 8px 4px;
  }
  .cert-modal-title {
    font-size: 1rem;
    margin-bottom: 10px;
  }
  .cert-modal-img {
    max-width: 96vw;
    max-height: 40vh;
  }
}
</style> 