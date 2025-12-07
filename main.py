import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pyautogui as pag
import time
from dotenv import load_dotenv
from dotenv import find_dotenv

env_file = find_dotenv(".env")
load_dotenv(env_file)

driver = webdriver.Chrome()
driver.get("https://wocabee.app/app")
title = driver.title

login = driver.find_element(By.ID, value="login")
password = driver.find_element(By.ID, value="password")
send = driver.find_element(By.ID, value="submitBtn")

login.send_keys(os.getenv("USERNAME"))
password.send_keys(os.getenv("PASSWORD"))
send.click()

WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "flag"))).click()

url = driver.current_url
trida = url[url.find("class_id=")+9:url.find("&refresh=")]

print("cislo balicku (napr. 1234567): ")
balicekID = input()

print("rezim cviceni: ")
mode = input()

print(
    "\nbalicek: " + balicekID,
    "\ntrida: " + trida, 
    "\nrezim: " + mode)
    
driver.find_element(By.ID, value=f"btnRun{balicekID}").click()