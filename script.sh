for filename in ./flux/components/*; do
  count=0
  while read line; do
    if [ "$line" = "" ]; then
      echo $filename
      echo $count
      sed '$count a <LINE-TO-BE-ADDED>' $filename
      break
    fi
    prevline=$line
    count=$(($count + 1))
  done < $filename
done
