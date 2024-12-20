(() => {
    'use strict';

    class ImageGallery {
        static defaultSettings = {
            gap: 10,                // расстояние между элементами [px]
            visibleElements: 3,     // количество одновременно отображаемых элементов
            borderWidth: 0,         // толщина рамки [px]
            isResponsive: true,     // адаптивность галереи
            autoSlide: false,       // автоматическая прокрутка
            slideInterval: 3000,    // интервал автопрокрутки [ms]
            showNavigation: true,   // отображение кнопок навигации
            showPagination: false,  // отображение индикаторов страниц
            enableKeyControl: false,// управление клавишами
            animate: false,         // включить анимацию
            transitionSpeed: 0.4,   // скорость анимации [s]
            resizeDelay: 250,       // задержка при изменении размера окна [ms]
            edgeLimit: 30           // ограничение смещения для крайних элементов [px]
        };

        static KEY_LEFT = 37; // клавиша стрелка влево
        static KEY_RIGHT = 39; // клавиша стрелка вправо

        constructor(container, config) {
            this.container = container;
            this.config = config;
            this.slider = container.querySelector('.slider');
            this.stage = container.querySelector('.stage');
            this.elements = container.querySelectorAll('.stage > div');
            this.total = this.elements.length;
            this.currentIndex = 0;
            this.nextIndex = 0;
            this.dragging = false;
            this.startPosition = 0;
            this.offset = 0;
            this.initialize();
        }

        static mergeSettings(base, ...overrides) {
            return Object.assign({}, base, ...overrides);
        }

        static getPointerPosition(event) {
            return event.targetTouches && event.targetTouches.length > 0 ? event.targetTouches[0].clientX : event.clientX;
        }

        initialize() {
            this.options = ImageGallery.mergeSettings(ImageGallery.defaultSettings, this.config);
            this.setupGallery();
            this.calculatePositions();
            this.initializeControls();
            if (!this.eventHandlersInitialized) {
                this.registerEventListeners();
            }
        }

        setupGallery() {
            this.sliderWidth = this.slider.offsetWidth;
            if (this.options.isResponsive) this.adjustForResponsiveDesign();

            const itemWidth = (this.sliderWidth - this.options.gap * (this.options.visibleElements - 1)) / this.options.visibleElements;
            this.itemWidth = itemWidth + this.options.gap;
            this.totalWidth = this.itemWidth * this.total;
            
            this.stage.style.width = `${this.totalWidth}px`;
            
            this.elements.forEach(item => {
                item.style.cssText = `width: ${itemWidth}px; margin-right: ${this.options.gap}px;`;
            });

            setTimeout(() => {
                this.container.style.visibility = 'visible';
            }, 300);
        }

        calculatePositions() {
            let position = 0;
            this.positions = [];
            for (let i = 0; i < this.total; i++) {
                this.positions.push(position);
                position -= this.itemWidth;
            }
        }

        initializeControls() {
            this.navigation = this.container.querySelector('.navigation');
            this.pagination = this.container.querySelector('.pagination');

            if (this.options.showNavigation) {
                this.prevButton = this.navigation.querySelector('[data-action="prev"]');
                this.nextButton = this.navigation.querySelector('[data-action="next"]');
                this.updateNavigationState();
            }

            if (this.options.showPagination) {
                this.setupPagination();
            }
        }

        adjustForResponsiveDesign() {
            const screenWidth = document.documentElement.clientWidth;
            const breakpoints = Object.keys(this.options.responsive || {}).map(Number).sort((a, b) => a - b);

            let activeBreakpoint = breakpoints.find(bp => screenWidth <= bp) || breakpoints[breakpoints.length - 1];

            if (this.options.responsive && this.options.responsive[activeBreakpoint]) {
                Object.assign(this.options, this.options.responsive[activeBreakpoint]);
            }
        }

        updateNavigationState() {
            this.prevButton?.classList.toggle('disabled', this.currentIndex === 0);
            this.nextButton?.classList.toggle('disabled', this.currentIndex >= this.total - this.options.visibleElements);
        }

        setupPagination() {
            if (this.pagination) {
                // Удалить все существующие точки перед добавлением новых
                this.pagination.innerHTML = '';
            }
            //this.pagination.innerHTML = '';
            // Рассчитать необходимое количество точек
            const totalPages = Math.ceil(this.total / this.options.visibleElements);
            this.dots = Array.from({ length: totalPages }, (_, i) => {
                const dot = document.createElement('li');
                dot.dataset.index = i; // Привязать индекс для удобного использования
                this.pagination.appendChild(dot);
                return dot;
            });
            // Обновить состояние пагинации
            this.updatePaginationState();
        }
        updatePaginationState() {
            if (!this.dots || this.dots.length === 0) return;
            // Удалить класс 'active' у всех точек
            this.dots.forEach(dot => dot.classList.remove('active'));
            // Рассчитать текущую группу по индексу
            const activeIndex = Math.floor(this.currentIndex / this.options.visibleElements);
            this.dots[activeIndex]?.classList.add('active');
        }

        registerEventListeners() {
            window.addEventListener('resize', this.handleResize.bind(this));

            if (this.options.autoSlide) {
                setInterval(() => this.autoSlide(), this.options.slideInterval);
            }

            this.navigation?.addEventListener('click', this.handleNavigationClick.bind(this));
            this.pagination?.addEventListener('click', this.handlePaginationClick.bind(this));

            if (this.options.enableKeyControl) {
                window.addEventListener('keydown', this.handleKeyPress.bind(this));
            }

            this.stage.addEventListener('mousedown', this.handleDragStart.bind(this));
            this.stage.addEventListener('mousemove', this.handleDragging.bind(this));
            this.stage.addEventListener('mouseup', this.handleDragEnd.bind(this));
            this.stage.addEventListener('mouseout', this.handleDragEnd.bind(this));

            this.stage.addEventListener('touchstart', this.handleDragStart.bind(this));
            this.stage.addEventListener('touchmove', this.handleDragging.bind(this));
            this.stage.addEventListener('touchend', this.handleDragEnd.bind(this));

            this.eventHandlersInitialized = true;
        }

        handleResize() {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.initialize();
                this.currentIndex = Math.min(this.currentIndex, this.total - this.options.visibleElements);
                this.scrollTo(this.positions[this.currentIndex], this.options.transitionSpeed);
            }, this.options.resizeDelay);
        }

        autoSlide() {
            this.moveToNext(1);
        }

        handleNavigationClick(event) {
            const action = event.target.dataset.action;
            if (!action) return;
            this.moveToNext(action === 'next' ? 1 : -1);
        }

        handlePaginationClick(event) {
            const dotIndex = this.dots.indexOf(event.target);
            if (dotIndex === -1 || event.target.classList.contains('active')) return;
            // Рассчитываем начальный индекс для группы элементов
            this.nextIndex = dotIndex * this.options.visibleElements;
            // Учитываем общее количество элементов
            this.nextIndex = Math.min(this.nextIndex, this.total - this.options.visibleElements);
            this.scrollTo(this.positions[this.nextIndex], this.options.transitionSpeed);
        }

        handleKeyPress(event) {
            if (event.keyCode === ImageGallery.KEY_LEFT) this.moveToNext(-1);
            if (event.keyCode === ImageGallery.KEY_RIGHT) this.moveToNext(1);
        }

        handleDragStart(event) {
            event.preventDefault();
            this.dragging = true;
            this.startPosition = ImageGallery.getPointerPosition(event);
        }

        handleDragging(event) {
            if (!this.dragging) return;
            this.offset = this.startPosition - ImageGallery.getPointerPosition(event);
            const newPosition = this.positions[this.currentIndex] - this.offset;
            if (Math.abs(newPosition) <= this.options.edgeLimit) {
                this.scrollTo(newPosition, 0);
            }
        }

        handleDragEnd(event) {
            if (!this.dragging) return;
            this.dragging = false;
            const direction = Math.abs(this.offset) > this.itemWidth / 2 ? Math.sign(this.offset) : 0;
            this.moveToNext(direction);
        }

        moveToNext(direction) {
            if (direction !== 0) {
                this.nextIndex = Math.max(
                    0,
                    Math.min(
                        this.currentIndex + direction * this.options.visibleElements, 
                        this.total - this.options.visibleElements
                    )
                );
            }
            this.scrollTo(this.positions[this.nextIndex], this.options.transitionSpeed);
        }

        scrollTo(position, duration) {
            this.stage.style.transition = `transform ${duration}s`;
            this.stage.style.transform = `translateX(${position}px)`;
            this.currentIndex = this.nextIndex;
            if (this.options.showNavigation) this.updateNavigationState();
            if (this.options.showPagination) this.updatePaginationState();
        }
    }

    document.querySelectorAll('.gallery').forEach(container => {
        const settings = JSON.parse(container.dataset.settings || '{}');
        new ImageGallery(container, settings);
    });
})();
document.getElementById('back-to-shop').addEventListener('click', () => {
    window.location.href = 'shop.html'; // Переход на shop.html
});