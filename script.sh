for filename in ./flux/components/*; do
  count=0
  while read line; do
    if [ "$line" = "" ]; then
      echo $filename
      echo $count
      newcontents=$(gsed '1 a test' $filename)
      > $filename
      cp $newcontents $filename
      break
    fi
    prevline=$line
    count=$(($count + 1))
  done < $filename
done
