require 'rubygems'
require 'sinatra'
require 'prowl'
require 'lib/podcast.rb'

get '/' do
  'Podcasts'
end

get '/podcasts/:podcast' do
  @podcast = Podcast.new(params[:podcast])
  erb :podcast
end
