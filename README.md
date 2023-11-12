## Запуск в Docker
### create docker network:
    docker network create service-network
### build:
    docker compose build
### up:
    docker compose up

  
## Типы HTTP-запросов: GET, POST, PATCH

  ### POST /api/user
      вход: {
	      "email": "teslog@ro.ru",
	      "password": "223231312",
	      "first_name": "22222",
	      "last_name": "asd",
	      "phone": "+7922232255100"
      }
      Проверяет валидность данных. Если невалидные - ошибка.
      -- Записали в базу пользователя.

### GET /api/users
      выход: users[]
      
    получить список пользователей
      


### PATCH /api/user
      вход: {
	    "id": 6,
	    "email": "a@bk.ru"
      .....     
      }
    Если все поля пустые, либо все данные неизменны = ошибка.
    
    изменять данные конкретного пользователя
