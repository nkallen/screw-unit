require "rubygems"
require "spec"

dir = File.dirname(__FILE__)
require File.expand_path("#{dir}/../lib/screw_unit")

Spec::Runner.configure do |config|
  config.mock_with :rr
end

at_exit do
  Spec::Runner.run
end
