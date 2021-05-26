class String
  def starts_with?(prefix)
    index(prefix) == 0
  end

  def path_starts_with?(prefix)
    split('/').starts_with?(prefix.split('/'))
  end
end
