import json, subprocess, sys
from pathlib import Path
AWS = r"C:\Program Files\Amazon\AWSCLIV2\aws.exe"
def aws(*args):
    p = subprocess.run([AWS, *args, "--region", "us-east-1", "--output", "json"], capture_output=True, text=True)
    if p.returncode: raise RuntimeError(p.stderr)
    return json.loads(p.stdout)
if __name__ == "__main__":
    if Path("scripts/verification-task.json").exists():
        print(Path("scripts/verification-task.json").read_text())
        sys.exit(0)
    network = aws("ecs", "describe-services", "--cluster", "event-mgmt-cluster", "--services", "event-mgmt-backend")["services"][0]["networkConfiguration"]
    result = aws("ecs", "run-task", "--cluster", "event-mgmt-cluster", "--task-definition", "event-mgmt-backend:5", "--launch-type", "FARGATE", "--network-configuration", json.dumps(network), "--overrides", json.dumps({"containerOverrides":[{"name":"backend","command":["python","-c",Path(sys.argv[1]).read_text()]}]}))
    if result.get("failures"): raise RuntimeError(result["failures"])
    task = result["tasks"][0]["taskArn"]
    Path("scripts/verification-task.json").write_text(json.dumps({"task":task}, indent=2))
    print(task)
