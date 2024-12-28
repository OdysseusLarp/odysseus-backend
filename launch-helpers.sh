# Get current script dir
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME variables
source "$SCRIPT_DIR/.env"

check_postgres() {
	PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' &>/dev/null
}
wait_for_postgres() {
	until check_postgres; do
		echo >&2 "Postgres is unavailable - sleeping"
		sleep 1
	done
	echo >&2 "Postgres is up - continuing"
}

wait_for_server() {
	until curl -s http://localhost:8888; do
		echo >&2 "Server is unavailable - sleeping"
		sleep 1
	done
	echo >&2 "Server is up - continuing"
}

wait_for_frontend() {
	until curl -s http://localhost:4200; do
		echo >&2 "Frontend is unavailable - sleeping"
		sleep 1
	done
	echo >&2 "Frontend is up - continuing"
}
