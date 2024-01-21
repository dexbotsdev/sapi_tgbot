import { newburnsChannelId, newpoolsChannelId } from './config.js';
import { NewPoolFinder } from './NewPoolsService.js';
import { NewBurnService } from './NewBurnService.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

await NewBurnService(newburnsChannelId);


