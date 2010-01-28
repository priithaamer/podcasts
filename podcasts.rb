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

get '/pingme!' do
  erb :pingme
end

post '/sendping' do
  p = Prowl.new(:apikey => "6f11cefb79d559b6c6269f0d486ad1488ffe77e8", :application => 'priit.fraktal.ee')
  p.valid?
  p.add(:event => params[:name], :description => params[:message])
  erb :sendping
end
