import { Controller } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
    constructor(private readonly ragService: RagService) { }

    // Implement RAG-specific endpoints here
    
}
