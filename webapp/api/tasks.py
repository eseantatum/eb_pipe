import os
import time

from celery import Celery

#from project.server.scraper import Scraper

#from project.server.configFuns import importConfig


celery = Celery(__name__)
celery.conf.broker_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379")
celery.conf.result_backend = os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379")



# @celery.task(name="create_task")
# def create_task(task_type):
#     scraper = Scraper()
#     if task_type == 1:
#         ### Load Config JSON From Memory..
#         configDict = importConfig("/usr/src/app/project/client/static/config.json")
#         twitterSearches = configDict['twitter']['search_list']
#         telegramSearches = configDict['telegram']['search_list']
#         defaultParams = configDict['default_params']
#
#         for search in twitterSearches:
#             scraper.type = "Twitter"
#             scraper.config = search
#             ### NOTE: This probably shouldn't be hardcoded.
#             scraper.dest = "/usr/src/app/project/client/static/img"
#             scraper.defaults = defaultParams
#             scraper.scrape()
#             print("SCRAPE COMPLETE")
#
#         for search in telegramSearches:
#             scraper.type = "Telegram"
#             scraper.config = search
#             ### NOTE: This probably shouldn't be hardcoded.
#             scraper.dest = "/usr/src/app/project/client/static/img"
#             scraper.defaults = defaultParams
#             scraper.scrape()
#             print("SCRAPE COMPLETE")
#
#     # DEBUG CODE
#     #scraper = Scraper("Twitter",{"type": "topic", "start_date": "2022-09-01", "end_date": "CURRENT", "search": "putin", "n_tweets": 250, "kwList": "def"},"/usr/src/app/project/client/static/img", {"start_date": "2022-08-01", "end_date": "CURRENT", "n_tweets": 25, "default_kwList": ["russia","NATO","BMP","su 25"]})
#     #scraper.scrape()
#     return True
