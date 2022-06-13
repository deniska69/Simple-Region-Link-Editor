# Web-Приложение "Simple Region Link Editor"

Simple Region Link Editor - Web-Приложение разработанное для автоматизации процесса создания ссылок-областей.

Работа с приложением происходит следующим образом:

На начальном экране пользователю доступны два способа загрузки изображения:

- "Выбрать изображение" - в данном случае пользователю откроется диалоговое окно для выбора файла, с последующей проверкой выбранного файла на соответствие изображению и загрузкой на хостинг [imageban.ru](https://imageban.ru/) посредством выполнения POST-запроса к API, для получения прямого URL на изображение.
- "Загрузить по ссылке" - в данном случае пользователю открой модальное окно для ввода URL, с последующей проверкой URL на содержание изображения.

После выбора/загрузки изображения пользователю отобразится интерфейс создания ссылок-областей. Интерфейс включает в себя:

- Кнопка "Добавить область" - активирует режим "рисования" областей на выбранном/загруженном изображении.
- Кнопка переключения режим "отрисовки":
  - "Режим растягивания" - в данном режиме для отрисовки каждой области необходимо:
    1. Навести курсов мыши на изображение расположенное слева от элементов управления;
    2. Зажать левую кнопку мыши;
    3. С зажатой левой кнопкой мыши переместить курсор - что приведёт к визуальному отображению прямоугольника;
    4. После перемещения курсора и выбора достаточного размера прямоугольника-области отпустить левую кнопку мыши;
    5. В открывшемся модальном окне по необходимости (это также можно сделать позже) ввести название нарисованной области и URL, нажать "ОК";
    6. Для ввода следующей области-ссылки повторить п.1-5, для деактивации режима отрисовки нажать на кнопку "Укажите область на изображении".
  - "Режим ввода двух точек" - в данном режиме для отрисовки каждой области необходимо:
    1. Навести курсов мыши на изображение расположенное слева от элементов управления;
    2. Нажать левую кнопку мыши;
    3. Переместить курсор - что приведёт к визуальному отображению прямоугольника;
    4. После перемещения курсора и выбора достаточного размера прямоугольника-области ещё раз нажать левую кнопку мыши;
    5. Для ввода следующей области-ссылки повторить п.1-4, для деактивации режима отрисовки нажать на кнопку "Укажите область на изображении".
- Кнопка "Режим множественного добавления" - отключает отображение модального описанного в п.5 для "Режима растягивания".
- После отрисовки областей ссылок, пользователю станут доступны элементы для их редактирования, которые содержат:
  - Порядковый номер области-ссылки для удобства визуального восприятия;
  - Название области-ссылки;
  - Ссылка области ссылки;
  - Кнопка редактирования области-ссылки - вызывающая модальное окно для ввода названия и URL;
  - Кнопка удаления области-ссылки.
- Кнопка "Получить готовый HTML-код" - вызывающая модальное окно, содержащее готовый HTML-код для ручного копирования, а также содержащее кнопку с функцией копирования выведенного HTML-кода.

## Язык разработки:

```
JavaScript
```

## CSS-Фреймворк:

```
Bootstrap
```

# Важная информация:

Для работы приложения необходимо получить TOKEN, выдающийся после регистрации на сайте [imageban.ru](https://imageban.ru/) и вставить его в в файл [/js/script.js](https://github.com/deniska69/Simple-Region-Link-Editor/blob/main/js/script.js) в переменную "TOKEN_IMAGEBAN" расположенную на 25-й строке файла.
