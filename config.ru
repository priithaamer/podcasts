require 'rubygems'
require 'sinatra'
 
set :environment, :production
disable :run

require 'podcasts.rb'

run Sinatra::Application
