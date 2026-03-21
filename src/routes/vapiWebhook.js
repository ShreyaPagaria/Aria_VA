import { Router } from 'express';
import { createCalendarEvent } from '../lib/googleCalendar.js';
import { assertValidIso, ensureEndIso } from '../lib/dateUtils.js';
import { config } from '../config.js';

const router = Router();

function buildResult(toolCallId, result) {
  return {
    toolCallId,
    result
  };
}

router.post('/webhook', async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || message.type !== 'tool-calls') {
      return res.json({
        received: true,
        note: 'No tool call payload found'
      });
    }

    const toolCalls = message.toolCallList || [];
    const results = [];

    for (const toolCall of toolCalls) {
      if (toolCall.name !== 'create_calendar_event') {
        results.push(
          buildResult(toolCall.id, {
            success: false,
            error: `Unsupported tool: ${toolCall.name}`
          })
        );
        continue;
      }

      const args = toolCall.arguments || {};
      const name = args.name || 'Guest';
      const meetingTitle = args.meetingTitle || `Meeting with ${name}`;
      const startISO = args.startISO;
      const endISO = ensureEndIso(args.startISO, args.endISO);
      const timezone = args.timezone || config.defaultTimezone;

      assertValidIso(startISO, 'startISO');
      assertValidIso(endISO, 'endISO');

      const event = await createCalendarEvent({
        name,
        meetingTitle,
        startISO,
        endISO,
        timezone
      });

      results.push(
        buildResult(toolCall.id, {
          success: true,
          message: 'Calendar event created successfully.',
          event
        })
      );
    }

    return res.json({ results });
  } catch (error) {
    console.error('Vapi webhook error:', error);

    const toolCalls = req.body?.message?.toolCallList || [];
    const results = toolCalls.map((toolCall) =>
      buildResult(toolCall.id, {
        success: false,
        error: error.message || 'Unknown server error'
      })
    );

    return res.status(200).json({ results });
  }
});

export default router;
