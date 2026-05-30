cmake_minimum_required(VERSION 3.10)
project(organism_runtime LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)

add_executable(organism
    src/organism.cpp
    src/main.cpp
)

target_include_directories(organism PRIVATE include)
target_link_libraries(organism PRIVATE Threads::Threads)
