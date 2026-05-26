from apscheduler.schedulers.blocking import BlockingScheduler


def poll_satellite_data() -> None:
    print("scheduler: dataset.poll.requested")


def main() -> None:
    scheduler = BlockingScheduler()
    scheduler.add_job(poll_satellite_data, "interval", minutes=30)
    scheduler.start()


if __name__ == "__main__":
    main()

