const blockSelectImage = document.querySelector(".select_image"); //Блок выбора изображения
const blockImageEditor = document.querySelector(".image_editor"); //Блок работы с изображением
const container = document.querySelector(".container"); //Блок в который помещается редактор
const image_editor = document.querySelector(".image_editor"); //Блок редактора
const colImage = document.querySelector(".col_image"); //Блок в который помещается изображение
const colControl = document.querySelector(".col_control"); //Блок в котором находится управление
let colImagePaddingLeft = window.getComputedStyle(colImage, null).getPropertyValue("padding-left"); //Внутреннее растояние блока, в который помещается изображение (в пикселях (12px))
colImagePaddingLeft = colImagePaddingLeft.substring(0, 2); //Внутреннее растояние блока, в который помещается изображение
const srleImg = document.querySelector(".srleImg"); //Тег, в который помещается изображение
let imageInput = new Image(); //Переменная для работы с изображением
let imageInputHeight = 0; //Высота загружаемого изображения
let imageInputWidth = 0; //Ширина загружаемого изображения
let isAddUrlMode = false; //Режим добавления URL-областей
let isDrawUrlMode = false; //Режим рисования области ссылки
let mouseX1 = 0; //Координаты первой точки прямоугольника по оси X
let mouseY1 = 0; //Координаты первой точки прямоугольника по оси Y
let mouseX2 = 0; //Координаты второй точки прямоугольника по оси X
let mouseY2 = 0; //Координаты второй точки прямоугольника по оси Y
const modeInputSwitch = document.getElementById("modeInputSwitch"); //Получаем доступ к переключателю режима отрисовки (по двум точкам или растягиванию)
const modeInputMultiple = document.getElementById("modeInputMultiple"); //Получаем доступ к переключателю "Режим множественного добавления"
const labelModeInputSwitch = document.getElementById("labelModeInputSwitch"); //Получаем доступ к лейблу переключателя режимов отрисовки
let isMouseDown = false;
const btnShowModalHTML = document.querySelector(".btnShowModalHTML"); //Получаем доступ к кнопке вызова модального окна вывода готового HTML
const codeCompleteHTML = document.getElementById("codeCompleteHTML"); //Получаем доступ к блоку для вывода готового HTML
const TOKEN_IMAGEBAN = ""; //Токен для подключения к API ImageBan

//Устанавливаем переключателям значения по-умолчанию
modeInputSwitch.checked = false;
modeInputMultiple.checked = false;

//Обработка нажатия кнопки "Выбрать изображение" >> ручная инициализация элемента <Input> через вызов метода click()
function showFileInput() {
  //Получаем доступ к Input-элементу
  let fileInput = document.getElementById("fileInput");

  //Вручную инициализируем нажатие по элементу
  fileInput.click();
}

//Процесс выбора и загрузки изображения с компьютера
function processFiles(files) {
  //Ограничение выбора одного файла путём выбора 0-го элемента (файла) из массива
  let file = files[0];

  //Определяем, является ли загружаемый файл изображением
  const isImage = file.type == "image/jpg" || file.type == "image/jpeg" || file.type == "image/png";

  if (!isImage) {
    alert("Пожалуйста, загрузите изображение");
    return;
  }

  //Задаём ограничение по весу изображение в мбайтах
  let mb = 10;

  //Определяем, вес изображения
  if (file.size / 1024 / 1024 > mb) {
    alert("Пожалуйста, выберите изображение размером менее " + mb + " Мбайт");
    return;
  }

  //Передаём изображение в функцию загрузки изображения на хостинг
  uploadImageOnHosting(file);
}

//Функция загрузки изображения на хостинг https://imageban.ru/
function uploadImageOnHosting(file) {
  //СОздаём переменную под URL изображения
  let urlRecieve = "";

  var fd = new FormData();
  fd.append("image", file);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.imageban.ru/v1");

  //Отправляем POST запрос на хостинг
  xhr.onload = function () {
    //Парсим из JSON-ответа от хостинга URL изображения
    urlRecieve = JSON.parse(xhr.responseText).data.link;

    //Если полученный URL не является пустым
    if (urlRecieve != "") {
      //Вызываем функцию загрузки изображения по ссылке
      uploadImageFromUrl(urlRecieve);
    } else {
      //В случае ошибка выводим сообщение об ошибке
      alert("Возникла ошибка при загрузке изображения на хостинг.");
    }
  };

  xhr.setRequestHeader("Authorization", `TOKEN ${TOKEN_IMAGEBAN}`);
  xhr.send(fd);
}

//Обработка нажатия кнопки "Загрузить по ссылке"
function uploadImageFromUrl(url) {
  //Создаём элемент изображение
  const imageCheck = new Image();

  //Если при вызове функции был получен URL изображения
  if (url != "") {
    //Назначаем URL в объект Image
    imageCheck.src = url;

    //Проверяем ссылку на содержание изображения >> в случае успеха вызываем функцию масштабирования изображения
    imageCheck.onload = function () {
      //Вызываем функцию масштабирования изображения
      resizeImage(url);
    };
  } else {
    //Получаем доступ к элементу для ввода ссылки
    const urlInput = document.getElementById("urlInputImage");

    //Получаем URL из текстового поля
    const urlInputImage = document.getElementById("urlInputImage").value;

    //Назначаем URL в объект Image
    imageCheck.src = urlInputImage;

    //Проверяем ссылку на содержание изображения >> в случае успеха прячем модальное окно и вызываем функцию масштабирования изображения
    imageCheck.onload = function () {
      //Скрываем модальное окно ввода URL
      const setImageFromUrl = document.querySelector("#setImageFromUrl");
      const modal = bootstrap.Modal.getInstance(setImageFromUrl);
      modal.hide();

      //Вызываем функцию масштабирования изображения
      resizeImage(urlInputImage);
    };

    //Проверяем ссылку на содержание изображения >> в случае ошибки прекращаем выполнение функции и отмечаем поле "не валидным"
    imageCheck.onerror = function () {
      urlInput.classList.add("is-invalid");
    };
  }
}

//Функция масштабирования загруженного изображения
function resizeImage(url) {
  //Получаем URL из текстового поля
  const urlInputImage = url;

  //Назначаем URL в объект Image
  imageInput.src = urlInputImage;

  //Задаём максимальную ширину карточки редактора
  image_editor.style.maxWidth = container.clientWidth + "px";

  //Задаём максимальную ширину блока под изображение
  colImage.style.maxWidth = (container.clientWidth / 12) * 8 + "px";

  //Задаём максимальную ширину блока под элементы управления
  colControl.style.maxWidth = (container.clientWidth / 12) * 4 + "px";

  //Загружаем изображение
  imageInput.onload = () => {
    //Используем URL изображения для заполнения фона
    srleImg.style.backgroundImage = "url('" + urlInputImage + "')";

    //Ширина загружаемого изображения
    imageInputWidth = imageInput.naturalWidth;

    //Высота загружаемого изображения
    imageInputHeight = imageInput.naturalHeight;

    //Скрываем блок выбора изображения
    blockSelectImage.classList.add("_hide");

    //Показываем блок редактирования изображения
    blockImageEditor.classList.remove("_hide");

    //Если ширина изображения > высоты изображения
    if (imageInputWidth > imageInputHeight) {
      //Если ширина изображения > ширина блока, куда помещается изображение
      if (imageInputWidth > colImage.clientWidth) {
        //Вычисляем ширину и высоту изображения, выводимого на страницу ихображения, с учётом внутренних отступов блока, куда оно помещается
        let _width = colImage.clientWidth - colImagePaddingLeft * 2;
        let _height = (imageInputHeight * (colImage.clientWidth - colImagePaddingLeft * 2)) / imageInputWidth;

        //Назначаем CSS-стили для корректного отображения выводимого изображения на страницу
        srleImg.style.width = _width + "px";
        srleImg.style.height = _height + "px";
        srleImg.style.backgroundSize = _width + "px " + _height + "px";
      } else {
        //Назначаем CSS-стили для корректного отображения выводимого изображения на страницу
        srleImg.style.width = imageInputWidth + "px";
        srleImg.style.height = imageInputHeight + "px";
        srleImg.style.backgroundSize = imageInputWidth + "px " + imageInputHeight + "px";

        //Уменьшаем ширину блока редактора
        image_editor.style.maxWidth = imageInputWidth + colImagePaddingLeft * 2 + colControl.clientWidth + "px"; //Задаём максимальную ширину карточки редактора
        colImage.style.maxWidth = imageInputWidth + colImagePaddingLeft * 2 + "px"; //Задаём максимальную ширину блока под изображение
      }
    } else {
      //Если высота изображения > высоты блока, куда помещается изображение
      if (imageInputHeight > colImage.clientHeight) {
        //Вычисляем ширину и высоту изображения, выводимого на страницу ихображения
        let _width = (imageInputWidth * colImage.clientHeight) / imageInputHeight;
        let _height = colImage.clientHeight - colImagePaddingLeft * 2;

        //Назначаем CSS-стили для корректного отображения выводимого изображения на страницу
        srleImg.style.width = _width + "px";
        srleImg.style.height = _height + "px";
        srleImg.style.backgroundSize = _width + "px " + _height + "px";

        //Уменьшаем ширину блока редактора для квадратного изображения
        if (imageInputWidth === imageInputHeight) {
          image_editor.style.maxWidth = _height + colImagePaddingLeft * 4 + colControl.clientWidth + "px"; //Задаём максимальную ширину карточки редактора
          colImage.style.maxWidth = _height + colImagePaddingLeft * 4 + "px"; //Задаём максимальную ширину блока под изображение
        }

        //Уменьшаем ширину блока редактора для "портретного"/"вертикального" изображения
        if (imageInputWidth < imageInputHeight) {
          image_editor.style.maxWidth = _width + colImagePaddingLeft * 2 + colControl.clientWidth + "px"; //Задаём максимальную ширину карточки редактора
          colImage.style.maxWidth = _width + colImagePaddingLeft * 2 + "px"; //Задаём максимальную ширину блока под изображение
        }
      } else {
        //Назначаем CSS-стили для корректного отображения выводимого изображения на страницу
        srleImg.style.width = imageInputWidth + "px";
        srleImg.style.height = imageInputHeight + "px";
        srleImg.style.backgroundSize = imageInputWidth + "px " + imageInputHeight + "px";

        //Уменьшаем ширину блока редактора
        image_editor.style.maxWidth = imageInputWidth + colImagePaddingLeft * 2 + colControl.clientWidth + "px"; //Задаём максимальную ширину карточки редактора
        colImage.style.maxWidth = imageInputWidth + colImagePaddingLeft * 2 + "px"; //Задаём максимальную ширину блока под изображение
      }
    }

    //Назначаем стили обтекания для блока с изображеним и блока с элементами управления
    colImage.style.float = "left";
    colControl.style.float = "right";

    //Задаём ширину блока с элементами управления
    colControl.style.width = image_editor.clientWidth - colImage.clientWidth - 3 + "px";
  };
}

//Кнопка активации режима отрисовки области новой ссылки
function addUrlMode() {
  //Получаем ссылку доступ к кнопке
  const progress_child = document.querySelector(".progress_btn_child");

  if (!isAddUrlMode) {
    //Включаем режим отрисовки области ссылки
    isAddUrlMode = true;

    //Изменяем внешний стиль кнопки
    progress_child.classList.add("progress-bar-striped");
    progress_child.classList.add("progress-bar-animated");
    progress_child.innerText = "Укажите область на изображении";

    //Вызываем функцию включения и выключения "кликабельности" ссылок - ВКЛ.
    pointerEventsURLAddOrRemove(false);

    //Отключаем переключатели режимов отрисовки
    modeInputSwitch.disabled = true;
    modeInputMultiple.disabled = true;

    //Отключаем кнопку вызова модального окна для вывода готовго HTML
    btnShowModalHTML.disabled = true;
  } else {
    //Выключаем режим отрисовки области ссылки
    isAddUrlMode = false;

    //Изменяем внешний стиль кнопки
    progress_child.classList.remove("progress-bar-striped");
    progress_child.classList.remove("progress-bar-animated");
    progress_child.innerText = "Добавить область";

    //Вызываем функцию включения и выключения "кликабельности" ссылок - ВКЛ.
    pointerEventsURLAddOrRemove(true);

    //Включаем переключатели режимов отрисовки
    modeInputSwitch.disabled = false;
    modeInputMultiple.disabled = false;

    //Включаем кнопку вызова модального окна для вывода готовго HTML
    btnShowModalHTML.disabled = false;
  }
}

//Изменение курсора при попадании в область загруженного изображения
srleImg.onmouseover = function () {
  if (isAddUrlMode) {
    this.style.cursor = "crosshair";
  } else {
    this.style.cursor = "default";
  }
};

//Изменение курсора при выходе из области загруженного изображения
srleImg.onmouseout = function () {
  this.style.cursor = "default";
};

//Функция обработки клика по изображению
srleImg.onclick = function (e) {
  //Если включен режим отрисовки области ссылки методом указывания двух точек
  if (!modeInputSwitch.checked) {
    //Если включен режим отрисовки области ссылки, но ещё не начата отрисовка >> нажат первый клик
    if (isAddUrlMode && !isDrawUrlMode) {
      //Вызываем функцию включения и выключения "кликабельности" ссылок - ВЫКЛ.
      pointerEventsURLAddOrRemove(false);

      //Получаем координаты изображения
      let srleImgCord = srleImg.getBoundingClientRect();

      //Вычисляем координаты первого клика относительно изображения (в процентах)
      mouseX1 = Math.round(((e.clientX - Math.round(srleImgCord.left)) * 100) / srleImgCord.width);
      mouseY1 = Math.round(((e.clientY - Math.round(srleImgCord.top)) * 100) / srleImgCord.height);

      //Создаём элемент ссылку
      let newLink = document.createElement("a");

      //Получаем id последней ссылки, задаём id + 1
      newLink.id = "srle" + (getLastIdUrl() + 1);

      //Указываем ссылку по умолчанию
      newLink.href = "";

      //Указываем остальные свойства и стили ссылки
      newLink.target = "_blank";
      newLink.style = "pointer-events: none; position: absolute; border: 1px solid rgba(255, 255, 255, .5); left: " + mouseX1 + "%; top: " + mouseY1 + "%; width: 0%; height: 0%;";

      //Получаем доступ к блоку куда необходимо вставить ссылку
      let srleGroupUrlsAndImg = document.querySelector(".srleGroupUrlsAndImg");

      //Вставляем ссылку
      srleGroupUrlsAndImg.append(newLink);

      //Подтверждаем отрисовку первой точки >> отрисовка начата
      isDrawUrlMode = true;

      return;
    }

    //Если включен режим отрисовки области ссылки, и начата отрисовка >> нажат второй клик
    if (isAddUrlMode && isDrawUrlMode) {
      //Если включен режим множественной отрисовки областей ссылок
      if (modeInputMultiple.checked) {
        //Оставляем включённым режим отрисовки
        isAddUrlMode = true;

        //Выключаем режим отрисовки второй точки
        isDrawUrlMode = false;

        //Вызываем функцию вывода созданной ссылки в таблицу передавая ей id созданной ссылки
        displayingLinksInATable(getLastIdUrl());

        return;
      } else {
        //Изменяем стиль курсора по-умолчанию
        this.style.cursor = "default";

        //Изменяем стиль кнопки
        const progress_child = document.querySelector(".progress_btn_child");
        progress_child.classList.remove("progress-bar-striped");
        progress_child.classList.remove("progress-bar-animated");
        progress_child.innerText = "Добавить область";

        //Отключаем режим отрисовки
        isAddUrlMode = false;
        isDrawUrlMode = false;

        //Включаем переключатели режимов отрисовки
        modeInputSwitch.disabled = false;
        modeInputMultiple.disabled = false;

        //Включаем кнопку вызова модального окна для вывода готовго HTML
        btnShowModalHTML.disabled = false;

        //Вызываем функцию включения и выключения "кликабельности" ссылок - ВКЛ.
        pointerEventsURLAddOrRemove(true);

        //Вызываем функцию вывода созданной ссылки в таблицу передавая ей id созданной ссылки
        displayingLinksInATable(getLastIdUrl());

        return;
      }
    }
  }
};

//Функция обработки нажатия мыши на изображении
srleImg.onmousedown = function (e) {
  //Если включен режим отрисовки области ссылки методом растягивания
  if (modeInputSwitch.checked) {
    //Если включен режим отрисовки области ссылки, но ещё не начата отрисовка >> нажат первый клик
    if (isAddUrlMode && !isDrawUrlMode) {
      //Вызываем функцию включения и выключения "кликабельности" ссылок - ВЫКЛ.
      pointerEventsURLAddOrRemove(false);

      //Получаем координаты изображения
      let srleImgCord = srleImg.getBoundingClientRect();

      //Вычисляем координаты первого клика относительно изображения (в процентах)
      mouseX1 = Math.round(((e.clientX - Math.round(srleImgCord.left)) * 100) / srleImgCord.width);
      mouseY1 = Math.round(((e.clientY - Math.round(srleImgCord.top)) * 100) / srleImgCord.height);

      //Создаём элемент ссылку
      let newLink = document.createElement("a");

      //Получаем id последней ссылки, задаём id + 1
      newLink.id = "srle" + (getLastIdUrl() + 1);

      //Указываем ссылку по умолчанию
      newLink.href = "";

      //Указываем остальные свойства и стили ссылки
      newLink.target = "_blank";
      newLink.style = "pointer-events: none; position: absolute; border: 1px solid rgba(255, 255, 255, .5); left: " + mouseX1 + "%; top: " + mouseY1 + "%; width: 0%; height: 0%;";

      //Получаем доступ к блоку куда необходимо вставить ссылку
      let srleGroupUrlsAndImg = document.querySelector(".srleGroupUrlsAndImg");

      //Вставляем ссылку
      srleGroupUrlsAndImg.append(newLink);

      //Подтверждаем отрисовку первой точки >> отрисовка начата
      isDrawUrlMode = true;

      //Записываем в переменную, что мышь нажата
      isMouseDown = true;

      return;
    }
  }
};

//Функция обработки движения курсора над изображением
srleImg.onmousemove = function (e) {
  //Если включен режим отрисовки области ссылки, и начата отрисовка (нажат первый клик) И (включен режим отрисовки по двум точкам ИЛИ (включен режим растягивания И нажата кнопка мыши)
  if (isAddUrlMode && isDrawUrlMode && (!modeInputSwitch.checked || (modeInputSwitch.checked && isMouseDown))) {
    //Получаем id последней добавленной ссылки
    let editUrl = document.getElementById("srle" + getLastIdUrl());

    //Получаем координаты изображения
    let srleImgCord = srleImg.getBoundingClientRect();

    //Получаем координаты курсора относительно изображения
    mouseX2 = Math.round(((e.clientX - Math.round(srleImgCord.left)) * 100) / srleImgCord.width);
    mouseY2 = Math.round(((e.clientY - Math.round(srleImgCord.top)) * 100) / srleImgCord.height);

    //Вычисляем координат курсора относительно первой точки и задаём соответствующие стили области ссылки
    if (mouseX2 >= mouseX1) {
      editUrl.style.width = mouseX2 - mouseX1 + "%";
    }

    if (mouseY2 >= mouseY1) {
      editUrl.style.height = mouseY2 - mouseY1 + "%";
    }

    if (mouseX2 <= mouseX1) {
      editUrl.style.left = mouseX2 + "%";
      editUrl.style.width = mouseX1 - mouseX2 + "%";
    }

    if (mouseY2 <= mouseY1) {
      editUrl.style.top = mouseY2 + "%";
      editUrl.style.height = mouseY1 - mouseY2 + "%";
    }
  }
};

//Функция обработки отжатия мыши на изображении
srleImg.onmouseup = function (e) {
  //Если включен режим отрисовки области ссылки методом растягивания и нажата кнпока мыши
  if (modeInputSwitch.checked && isMouseDown) {
    //Записываем в переменную, что кнопка мыши отжата
    isMouseDown = false;

    //Если включен режим отрисовки области ссылки, и начата отрисовка >> нажат второй клик
    if (isAddUrlMode && isDrawUrlMode) {
      //Если включен режим множественной отрисовки областей ссылок
      if (modeInputMultiple.checked) {
        //Оставляем включённым режим отрисовки
        isAddUrlMode = true;

        //Выключаем режим отрисовки второй точки
        isDrawUrlMode = false;

        //Вызываем функцию вывода созданной ссылки в таблицу передавая ей id созданной ссылки
        displayingLinksInATable(getLastIdUrl());

        return;
      } else {
        //Изменяем стиль курсора по-умолчанию
        this.style.cursor = "default";

        //Изменяем стиль кнопки
        const progress_child = document.querySelector(".progress_btn_child");
        progress_child.classList.remove("progress-bar-striped");
        progress_child.classList.remove("progress-bar-animated");
        progress_child.innerText = "Добавить область/ссылку";

        //Отключаем режим отрисовки
        isAddUrlMode = false;
        isDrawUrlMode = false;

        //Включаем переключатели режимов отрисовки
        modeInputSwitch.disabled = false;
        modeInputMultiple.disabled = false;

        //Включаем кнопку вызова модального окна для вывода готовго HTML
        btnShowModalHTML.disabled = false;

        //Вызываем функцию включения и выключения "кликабельности" ссылок - ВКЛ.
        pointerEventsURLAddOrRemove(true);

        //Вызываем функцию вывода созданной ссылки в таблицу передавая ей id созданной ссылки
        displayingLinksInATable(getLastIdUrl());

        return;
      }
    }
  }
};

//Функция получения ID последней добавленной ссылки (в случае отсутствия ссылок >> возвращает 0)
function getLastIdUrl() {
  //Получаем доступ к блоку, где находятся ссылки
  let srleGroupUrlsAndImg = document.querySelector(".srleGroupUrlsAndImg");

  //Создаём массив
  let arrayUrl = [];

  //Перебираем все элементы внутри блока
  for (var i = 0; i < srleGroupUrlsAndImg.childNodes.length; i++) {
    //Если элемент является ссылкой
    if (srleGroupUrlsAndImg.childNodes[i].tagName === "A") {
      //Добавляем этот элемент в массив
      arrayUrl.push(srleGroupUrlsAndImg.childNodes[i]);
    }
  }

  let lastId = 0; //Создаём id по-умолчанию

  //Если массив после перебора всех элементов в блоке не пустой
  if (arrayUrl.length != 0) {
    //Записываем в переменную последний найденный id
    lastId = Number(arrayUrl[arrayUrl.length - 1].id.slice(4));
  }

  //Возвращаем последний вычесленный id
  return lastId;
}

//Вывод созданных ссылок в таблицу
function displayingLinksInATable(id) {
  //Получаем доступ к таблице
  let table = document.querySelector(".tableUrl");

  //Получаем колличество строк в таблице
  let rowsCount = table.rows.length;

  //Получаем доступ к блоку, в котором хранится таблица
  let tableBlock = document.querySelector(".tableBlock");

  //Если блок содержит класс, который его скрывает
  if (tableBlock.classList.contains("_hide")) {
    //Удаляем класс скрывающий блок
    tableBlock.classList.remove("_hide");
  }

  //Если кнопка вызова модального окна для вывода готового HTML содержит класс, который её скрывает
  if (btnShowModalHTML.classList.contains("_hide")) {
    //Удаляем класс скрывающий блок
    btnShowModalHTML.classList.remove("_hide");
  }

  //Создаём элемент новой строки для таблицы
  let newRow = table.insertRow(rowsCount);
  newRow.id = "rowID_" + id;

  //Добавляем на строку события при наведении мыши для подсвечивания соответствующей области-ссылки
  newRow.onmouseover = function () {
    checkHoverOnRow(id, true);
  };
  newRow.onmouseout = function () {
    checkHoverOnRow(id, false);
  };

  //Создаём ячейку для первого столбца ------------------------------------------------
  let newCell0 = newRow.insertCell(0);
  newCell0.id = "cell0ID_" + id;
  newCell0.style.fontWeight = "bold"; //Устанавливаем жирный шрифт
  newCell0.style.width = "3vw";
  renameNumbersRowsInTable(); //Вызываем функцию для переименования порядковых номеров строк

  //Создаём ячейку для второго столбца ------------------------------------------------
  let newCell1 = newRow.insertCell(1);
  newCell1.style.width = "11vw";
  newCell1.id = "cell1ID_" + id;
  newCell1.innerText = "Без названия";

  //Создаём ячейку для третьего столбца ------------------------------------------------
  let newCell2 = newRow.insertCell(2);
  newCell2.style.width = "7vw";
  newCell2.id = "cell2ID_" + id;

  //Создаём элемент ссылку
  let newA = document.createElement("a");
  newA.id = "aTableID_" + id;
  newA.innerText = "Ссылка";
  newA.href = "";
  newA.target = "_blank";

  newCell2.append(newA); //Вставляем ссылку в ячейку

  //Создаём ячейку для четвёртого столбца ------------------------------------------------
  let newCell3 = newRow.insertCell(3);
  newCell3.style.width = "8vw";
  newCell3.id = "cell3ID_" + id;

  //Создаём элемент кнопку для редактирования ссылки
  let newBtn1 = document.createElement("button");
  newBtn1.id = "editBtnID_" + id;
  newBtn1.type = "button";
  newBtn1.classList.add("btn");
  newBtn1.classList.add("btn-warning");
  newBtn1.classList.add("btn-sm");
  newBtn1.onclick = function () {
    modalNewOrEditUrl(id);
  };

  //Создаём элемент иконку для кнопки редактирования ссылки
  let newI1 = document.createElement("i");
  newI1.classList.add("bi");
  newI1.classList.add("bi-pencil");
  newBtn1.append(newI1);

  newCell3.append(newBtn1); //Вставляем кнопку в ячейку

  //Создаём элемент кнопку для удаления ссылки
  let newBtn2 = document.createElement("button");
  newBtn2.id = "delBtnID_" + id;
  newBtn2.type = "button";
  newBtn2.classList.add("btn");
  newBtn2.classList.add("btn-danger");
  newBtn2.classList.add("btn-sm");
  newBtn2.style.marginLeft = "0.35rem";
  newBtn2.onclick = function () {
    delLinksInATable(id);
  };

  //Создаём элемент иконку для кнопки удаления ссылки
  let newI2 = document.createElement("i");
  newI2.classList.add("bi");
  newI2.classList.add("bi-trash");
  newBtn2.append(newI2);

  newCell3.append(newBtn2); //Вставляем кнопку в ячейку

  //Если выключен режим множественной отрисовки областей ссылок
  if (!modeInputMultiple.checked) {
    //Вызываем модальное окно для ввода названия и Url ссылки
    modalNewOrEditUrl(id);
  }
}

//Функция переназначения порядковых номеров строк в таблице
function renameNumbersRowsInTable() {
  //Получаем доступ к таблице
  let tableUrl = document.querySelector(".tableUrl");

  //Получаем доступ к потомка таблицы
  let childsTableUrl = tableUrl.querySelectorAll("*");

  //Создаём массив
  let arrayCell = [];

  //Перебираем всех потомков таблицы
  for (var i = 0; i < childsTableUrl.length; i++) {
    //Получаем ID элемента
    let id = childsTableUrl[i].id;

    //Если элемент является ячейкой и его ID содержит подстроку 'cell0ID_'
    if (childsTableUrl[i].tagName === "TD" && ~id.indexOf("cell0ID_")) {
      //Добавляем этот элемент в массив
      arrayCell.push(childsTableUrl[i]);
    }
  }

  //Перебираем массив полученных ячеек
  for (var i = 0; i < arrayCell.length; i++) {
    //Задаём новый порядковый номер для каждой ячейки
    arrayCell[i].innerText = i + 1;
  }
}

//Функция отображения модального окна для ввода названия и Url ссылки
function modalNewOrEditUrl(id) {
  //Получаем доступ к модальному окну
  let modal = new bootstrap.Modal(document.getElementById("modalNewOrEditUrl"));

  //Получаем доступ к элементу для ввода ссылки
  const inputUrlFromModal = document.getElementById("inputUrlFromModal");

  //Если поле для ввода URL содержит класс, который помечает его не валидным
  if (inputUrlFromModal.classList.contains("is-invalid")) {
    //Удаляем это класс
    inputUrlFromModal.classList.remove("is-invalid");
  }

  //Получаем доступ к полю для ввода "Названия ссылки"
  let newTitle = document.getElementById("inputTitleUrlFromModal");

  //Получаем доступ к полю для ввода "URL ссылки"
  let newUrl = document.getElementById("inputUrlFromModal");

  //Получаем доступ к ссылке на странице
  const aPage = document.getElementById("srle" + id);

  //Выводим в поле "Название ссылки" значение из ссылки на странице
  newTitle.value = aPage.title;

  //Выводим в поле "Ссылка" значение из ссылки на странице
  let str = aPage.href;
  if (~str.indexOf("file:///")) {
    newUrl.value = "";
  } else {
    newUrl.value = str;
  }

  //Получаем доступ к кнопке "ОК"
  const btn = document.querySelector(".btnSaveParametrsOfExistUrl");

  //Задаём ей ID ссылки
  btn.id = id;

  //Показываем модальное окно ввода URL
  modal.show();
}

//Функция для весения изменений в ссылку + вывод обновлённых данных в таблицу
function editParametrsOfExistUrlAndTable(id) {
  //Получаем доступ к открытому модальному окну
  const modalNewOrEditUrl = document.querySelector("#modalNewOrEditUrl");
  const modal = bootstrap.Modal.getInstance(modalNewOrEditUrl);

  //Получаем новое значение "Названия ссылки"
  let newTitle = document.getElementById("inputTitleUrlFromModal");

  //Получаем новое значение "URL ссылки"
  let newUrl = document.getElementById("inputUrlFromModal");

  //Поучаем доступ к ячейку с названием ссылки в соответствующей ячейке
  const titleTable = document.getElementById("cell1ID_" + id);

  //Поучаем доступ к ссылке в соответствующей ячейке
  const aTable = document.getElementById("aTableID_" + id);

  //Получаем доступ к ссылке на странице
  const aPage = document.getElementById("srle" + id);

  //Вносим новый URL ссылки в ссылку на странице и в таблицу
  if (newUrl.value != "") {
    let str = newUrl.value;

    //Если значение в поле новой ссылки содержит указанные ниже подстроки
    if (~str.indexOf("https://") || ~str.indexOf("http://")) {
      //Записываем новый URl в ссылку на странице
      aTable.href = newUrl.value;

      //Записываем новый URL в таблицу
      aPage.href = newUrl.value;
    } else {
      //Получаем доступ к элементу для ввода ссылки
      const inputUrlFromModal = document.getElementById("inputUrlFromModal");

      //Помечаем его невалидным
      inputUrlFromModal.classList.add("is-invalid");

      //Прерываем выполнение функции
      return;
    }
  } else {
    aTable.href = "";
    aPage.href = "";
  }

  //Вносим новое название ссылки в ссылку на стрнице и в таблицу
  if (newTitle.value != "") {
    //Вносим новое название ссылки в ссылку на странице
    aPage.title = newTitle.value;

    //Вносим новое название ссылки в ссылку в таблицу
    //Если название сильно длинное (15 символов) >> обрезаем и добавляем '...'
    if (newTitle.value.length >= 15) {
      let str = newTitle.value;
      titleTable.innerText = str.substring(0, 12) + "...";
    } else {
      titleTable.innerText = newTitle.value;
    }
  } else {
    titleTable.innerText = "Без названия";
    aPage.title = "";
  }

  //Скрываем модальное окно ввода URL
  modal.hide();

  //После всех операций очищаем поля для в модальном окне
  newTitle.value = "";
  newUrl.value = "";
}

//Функция удаления ссылки
function delLinksInATable(id) {
  //Получаем доступ к таблице
  let table = document.querySelector(".tableUrl");

  //Получаем доступ к удаляемой строке в таблице
  let delRow = document.getElementById("rowID_" + id);

  //Получаем доступ к удаляемой ссылке на странице
  let delA = document.getElementById("srle" + id);

  //Получаем доступ к блоку, в котором хранится таблица
  let tableBlock = document.querySelector(".tableBlock");

  //Удаляем строку из таблицы
  table.deleteRow(delRow.rowIndex);

  //Удаляем ссылку на странице
  delA.remove();

  //Если ссылок больше не осталось
  if (getLastIdUrl() === 0) {
    //Добавляем класс скрывающий блок
    tableBlock.classList.add("_hide");

    //Скрываем также кнопку вызова модального окна для вывода готового HTML
    btnShowModalHTML.classList.add("_hide");
  } else {
    //Вызываем функцию для переименования порядковых номеров строк
    renameNumbersRowsInTable();
  }
}

//Функция включения и выключения "кликабельности" ссылок
function pointerEventsURLAddOrRemove(mode) {
  //Получаем доступ к блоку, где находятся ссылки
  let srleGroupUrlsAndImg = document.querySelector(".srleGroupUrlsAndImg");

  //Создаём массив
  let arrayUrl = [];

  //Перебираем все элементы внутри блока
  for (var i = 0; i < srleGroupUrlsAndImg.childNodes.length; i++) {
    //Если элемент является ссылкой
    if (srleGroupUrlsAndImg.childNodes[i].tagName === "A") {
      //Добавляем этот элемент в массив
      arrayUrl.push(srleGroupUrlsAndImg.childNodes[i]);
    }
  }

  //Перебираем все элементы в массиве
  for (var i = 0; i < arrayUrl.length; i++) {
    //В зависимости от параметра при вызове функции
    if (mode) {
      //Включаем "кликабельность" ссылок
      arrayUrl[i].style.pointerEvents = "auto";
    } else {
      //Выключаем "кликабельность" ссылок
      arrayUrl[i].style.pointerEvents = "none";
    }
  }
}

//Функция для добавления/удаления класса для подстветки области-ссылки при наведении мыши на соответствующую строку в таблице
function checkHoverOnRow(id, mode) {
  //Получаем доступ к ссылке на странице
  let aHovered = document.getElementById("srle" + id);

  //В зависимости от полученного значения
  if (mode) {
    //Добавляем класс с подстветкой
    aHovered.classList.add("aHover");
  } else {
    //Удаляем класс с подстветкой
    aHovered.classList.remove("aHover");
  }
}

//Функция изменения текста на лейбле переключателя режима отрисовки
function changeModeInputSwitch() {
  if (modeInputSwitch.checked) {
    labelModeInputSwitch.innerText = "Режим растягивания";
  } else {
    labelModeInputSwitch.innerText = "Режим ввода двух точек";
  }
}

//Функция вывода готовго HTML кода в модальное окно
function outputCompleteHTML() {
  //Получаем код со страницы и записываем его блок в модальном окне
  codeCompleteHTML.innerText = colImage.innerHTML;
}

//Функция копирования готового HTML кода выведенного в модальное окне в буфер обмена
function copyToClipboard() {
  window.navigator.clipboard.writeText(codeCompleteHTML.innerText);
}
