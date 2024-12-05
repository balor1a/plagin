import sys
import os
import git
import keyboard

def push(repo_path, commit_message):
    try:
        repo = git.Repo(repo_path)

        # Stage all changes
        repo.git.add(A=True)

        # Commit changes
        repo.index.commit(commit_message)

        # Push to remote
        origin = repo.remote(name="origin")
        origin.push()

        print("Изменения успешно отправлены на GitHub!")
    except Exception as e:
        print(f"Произошла ошибка: {e}")

def push_on_keyboard():
    repo_path = "C:\cpp\dt\plagin-auto-push-to-github"  # Замените на путь к своему локальному репозиторию
    commit_message = "Автоматический коммит"

    push(repo_path, commit_message)

if __name__ == '__main__':
    print("Нажмите Ctrl + P для отправки кода на GitHub")
    keyboard.add_hotkey('ctrl+p', push_on_keyboard)  # Уберите скобки

    keyboard.wait('ctrl+alt+p')
