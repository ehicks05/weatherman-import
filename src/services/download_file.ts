import { createWriteStream } from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import axios from 'axios';

const finished = promisify(stream.finished);

export async function downloadFile(
  fileUrl: string,
  outputLocationPath: string,
): Promise<any> {
  const writer = createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); // this is a Promise
  });
}
