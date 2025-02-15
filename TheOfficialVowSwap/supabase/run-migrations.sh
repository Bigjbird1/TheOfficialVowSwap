#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Migration files in order
MIGRATIONS=(
    "initial_schema.sql"
    "wedding_services_schema.sql"
    "moderation_analytics_schema.sql"
)

# Progress file
PROGRESS_FILE=".migration_progress"

print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}        Supabase Migration Assistant${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_instructions() {
    echo -e "${YELLOW}Instructions for executing the migration:${NC}"
    echo -e "1. Visit ${BLUE}https://supabase.com/dashboard/project/_/sql${NC}"
    echo -e "2. Open the file: ${GREEN}$1${NC}"
    echo -e "3. Copy the SQL content into the SQL Editor"
    echo -e "4. Click 'Run' to execute the migration"
    echo -e "5. Check the output for any errors\n"
}

# Function to validate migration files exist
validate_files() {
    local all_exist=true
    for file in "${MIGRATIONS[@]}"; do
        if [ ! -f "migrations/$file" ]; then
            echo -e "${RED}Error: Migration file 'migrations/$file' not found${NC}"
            all_exist=false
        fi
    done
    
    if [ "$all_exist" = false ]; then
        echo -e "${RED}Some migration files are missing. Please check the migrations directory.${NC}"
        exit 1
    fi
}

# Function to get last completed migration
get_last_migration() {
    if [ -f "$PROGRESS_FILE" ]; then
        cat "$PROGRESS_FILE"
    else
        echo "-1"
    fi
}

# Function to update progress
update_progress() {
    echo "$1" > "$PROGRESS_FILE"
}

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local index=$2
    
    echo -e "\n${GREEN}Migration ${index}: ${file}${NC}"
    print_instructions "$file"
    
    # Show the SQL file content
    echo -e "${YELLOW}File content preview:${NC}"
    head -n 5 "migrations/$file"
    echo -e "${YELLOW}... (file continues)${NC}\n"
    
    while true; do
        echo -e "${YELLOW}Did you successfully execute this migration? (y/n/skip/quit)${NC}"
        read -r response
        case $response in
            y|Y)
                echo -e "${GREEN}✓ Migration $file completed${NC}"
                update_progress "$index"
                return 0
                ;;
            n|N)
                echo -e "${RED}× Migration failed. Please try again.${NC}"
                ;;
            skip|SKIP)
                echo -e "${YELLOW}⚠ Skipping migration $file${NC}"
                return 0
                ;;
            quit|QUIT)
                echo -e "${YELLOW}Migration process halted. You can resume from this point later.${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid response. Please enter y, n, skip, or quit${NC}"
                ;;
        esac
    done
}

main() {
    print_header
    validate_files
    
    # Get last completed migration
    last_completed=$(get_last_migration)
    
    echo -e "${GREEN}Starting Supabase migrations...${NC}"
    if [ "$last_completed" -ge 0 ]; then
        echo -e "${YELLOW}Resuming from after migration $((last_completed + 1))${NC}"
    fi
    
    # Execute migrations in order
    for i in "${!MIGRATIONS[@]}"; do
        if [ "$i" -gt "$last_completed" ]; then
            execute_sql_file "${MIGRATIONS[$i]}" "$i"
        fi
    done
    
    # Clean up progress file after successful completion
    rm -f "$PROGRESS_FILE"
    
    echo -e "\n${GREEN}🎉 Migrations complete!${NC}"
    echo -e "${YELLOW}Please verify all tables were created successfully in the Database section.${NC}"
}

main
